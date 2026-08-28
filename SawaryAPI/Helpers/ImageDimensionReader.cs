namespace SawaryAPI.Helpers;

// Reads pixel width/height directly from image file headers — no decoding, no external
// imaging library. Covers exactly the formats LocalImageStorageService allows to upload
// (jpg/jpeg/png/webp). Returns null on anything unparseable; callers must tolerate that
// and must not fail the upload just because dimensions couldn't be read.
public static class ImageDimensionReader
{
    public static (int Width, int Height)? TryReadDimensions(Stream stream, string ext)
    {
        try
        {
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            var bytes = ms.ToArray();

            return ext.ToLowerInvariant() switch
            {
                "png" => ReadPng(bytes),
                "jpg" or "jpeg" => ReadJpeg(bytes),
                "webp" => ReadWebp(bytes),
                _ => null,
            };
        }
        catch
        {
            return null;
        }
    }

    // ── PNG ──────────────────────────────────────────────────────────────────
    // Signature (8) + IHDR chunk: length(4) "IHDR"(4) width(4) height(4), all big-endian.
    private static (int, int)? ReadPng(byte[] b)
    {
        if (b.Length < 24) return null;
        if (b[0] != 0x89 || b[1] != 'P' || b[2] != 'N' || b[3] != 'G') return null;
        if (b[12] != 'I' || b[13] != 'H' || b[14] != 'D' || b[15] != 'R') return null;

        var width = ReadUInt32BE(b, 16);
        var height = ReadUInt32BE(b, 20);
        return ((int)width, (int)height);
    }

    // ── JPEG ─────────────────────────────────────────────────────────────────
    // Scan markers for a SOFn segment to get raw pixel size, and an APP1/Exif segment
    // to get orientation. If orientation implies a 90/270 rotation, swap width/height
    // so the stored size matches what browsers actually render.
    private static (int, int)? ReadJpeg(byte[] b)
    {
        if (b.Length < 4 || b[0] != 0xFF || b[1] != 0xD8) return null;

        int pos = 2;
        int? width = null, height = null;
        int orientation = 1;

        while (pos + 3 < b.Length)
        {
            if (b[pos] != 0xFF) { pos++; continue; }

            var marker = b[pos + 1];
            pos += 2;

            // Markers with no payload/length field.
            if (marker == 0xD8 || marker == 0xD9 || marker == 0x01 || (marker >= 0xD0 && marker <= 0xD7))
                continue;

            if (marker == 0xDA) break; // SOS — entropy-coded data follows, stop scanning

            if (pos + 1 >= b.Length) break;
            var segLen = ReadUInt16BE(b, pos);
            if (segLen < 2 || pos + segLen > b.Length) break;

            var isSof = marker >= 0xC0 && marker <= 0xCF && marker != 0xC4 && marker != 0xC8 && marker != 0xCC;
            if (isSof && pos + 6 < b.Length)
            {
                height = ReadUInt16BE(b, pos + 3);
                width = ReadUInt16BE(b, pos + 5);
            }
            else if (marker == 0xE1)
            {
                orientation = TryReadExifOrientation(b, pos + 2, segLen - 2) ?? orientation;
            }

            pos += segLen;

            if (width.HasValue && height.HasValue && orientation != 1)
                break; // have everything we need
        }

        if (!width.HasValue || !height.HasValue) return null;

        return orientation is >= 5 and <= 8
            ? (height.Value, width.Value)
            : (width.Value, height.Value);
    }

    private static int? TryReadExifOrientation(byte[] b, int start, int len)
    {
        if (len < 8 || start + 6 > b.Length) return null;
        if (!(b[start] == 'E' && b[start + 1] == 'x' && b[start + 2] == 'i' && b[start + 3] == 'f')) return null;

        var tiffStart = start + 6; // past "Exif\0\0"
        if (tiffStart + 8 > b.Length) return null;

        bool little = b[tiffStart] == 'I' && b[tiffStart + 1] == 'I';
        if (!little && !(b[tiffStart] == 'M' && b[tiffStart + 1] == 'M')) return null;

        var ifdOffset = tiffStart + (int)ReadUInt32(b, tiffStart + 4, little);
        if (ifdOffset + 2 > b.Length) return null;

        var entryCount = ReadUInt16(b, ifdOffset, little);
        for (var i = 0; i < entryCount; i++)
        {
            var entryOffset = ifdOffset + 2 + i * 12;
            if (entryOffset + 12 > b.Length) break;

            var tag = ReadUInt16(b, entryOffset, little);
            if (tag == 0x0112)
                return ReadUInt16(b, entryOffset + 8, little);
        }

        return null;
    }

    // ── WEBP ─────────────────────────────────────────────────────────────────
    // RIFF container: "RIFF" size "WEBP" <fourcc><chunkSize><chunkData...>
    private static (int, int)? ReadWebp(byte[] b)
    {
        if (b.Length < 30) return null;
        if (b[0] != 'R' || b[1] != 'I' || b[2] != 'F' || b[3] != 'F') return null;
        if (b[8] != 'W' || b[9] != 'E' || b[10] != 'B' || b[11] != 'P') return null;

        var fourCc = System.Text.Encoding.ASCII.GetString(b, 12, 4);
        var data = 20; // past fourcc(4) + chunkSize(4) starting at offset 12

        switch (fourCc)
        {
            case "VP8X":
                var w = Read24LE(b, data + 4) + 1;
                var h = Read24LE(b, data + 7) + 1;
                return (w, h);

            case "VP8 ":
                if (b[data + 3] != 0x9D || b[data + 4] != 0x01 || b[data + 5] != 0x2A) return null;
                var lw = ReadUInt16LE(b, data + 6) & 0x3FFF;
                var lh = ReadUInt16LE(b, data + 8) & 0x3FFF;
                return (lw, lh);

            case "VP8L":
                if (b[data] != 0x2F) return null;
                var packed = ReadUInt32(b, data + 1, littleEndian: true);
                var lossW = (int)(packed & 0x3FFF) + 1;
                var lossH = (int)((packed >> 14) & 0x3FFF) + 1;
                return (lossW, lossH);

            default:
                return null;
        }
    }

    // ── Byte readers ─────────────────────────────────────────────────────────
    private static uint ReadUInt32BE(byte[] b, int i) =>
        ((uint)b[i] << 24) | ((uint)b[i + 1] << 16) | ((uint)b[i + 2] << 8) | b[i + 3];

    private static int ReadUInt16BE(byte[] b, int i) => (b[i] << 8) | b[i + 1];

    private static int ReadUInt16LE(byte[] b, int i) => b[i] | (b[i + 1] << 8);

    private static int Read24LE(byte[] b, int i) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);

    private static uint ReadUInt32(byte[] b, int i, bool littleEndian) =>
        littleEndian
            ? (uint)(b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24))
            : ((uint)b[i] << 24) | ((uint)b[i + 1] << 16) | ((uint)b[i + 2] << 8) | b[i + 3];

    private static int ReadUInt16(byte[] b, int i, bool littleEndian) =>
        littleEndian ? (b[i] | (b[i + 1] << 8)) : ((b[i] << 8) | b[i + 1]);
}
