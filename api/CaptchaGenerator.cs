using System.Security.Cryptography;
using System.Text;

namespace TeatApp.Api;

// Excludes visually-confusable characters (0/O, 1/l/I) like the reference design.
public static class CaptchaGenerator
{
    private const string Charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private const int CodeLength = 6;
    private const int Width = 150;
    private const int Height = 50;

    private static readonly string[] Palette = { "#1f3864", "#2e2e2e", "#33475b", "#4a2545" };

    public static (string Code, string Svg) Generate()
    {
        var code = GenerateCode();
        var svg = RenderSvg(code);
        return (code, svg);
    }

    private static string GenerateCode()
    {
        var sb = new StringBuilder(CodeLength);
        for (var i = 0; i < CodeLength; i++)
        {
            sb.Append(Charset[RandomNumberGenerator.GetInt32(Charset.Length)]);
        }
        return sb.ToString();
    }

    private static string RandomColor() => Palette[RandomNumberGenerator.GetInt32(Palette.Length)];

    // Renders the code as an SVG image with a pale-pink background, per-glyph
    // rotation/offset jitter, and a couple of red squiggles crossing the text —
    // the same visual noise pattern as the reference "I am not a robot" widget.
    private static string RenderSvg(string code)
    {
        var glyphWidth = (double)Width / code.Length;
        var glyphs = new StringBuilder();
        for (var i = 0; i < code.Length; i++)
        {
            var x = glyphWidth * i + glyphWidth / 2;
            var y = Height / 2.0 + RandomNumberGenerator.GetInt32(-4, 5);
            var rotate = RandomNumberGenerator.GetInt32(-20, 21);
            var fontSize = RandomNumberGenerator.GetInt32(24, 30);
            glyphs.Append(
                $"<text x=\"{x:0.##}\" y=\"{y:0.##}\" font-family=\"Georgia, 'Times New Roman', serif\" " +
                $"font-weight=\"bold\" font-size=\"{fontSize}\" fill=\"{RandomColor()}\" text-anchor=\"middle\" " +
                $"dominant-baseline=\"middle\" transform=\"rotate({rotate} {x:0.##} {y:0.##})\">{code[i]}</text>");
        }

        var noiseLines = new StringBuilder();
        for (var i = 0; i < 3; i++)
        {
            var y1 = RandomNumberGenerator.GetInt32(5, Height - 5);
            var y2 = RandomNumberGenerator.GetInt32(5, Height - 5);
            var midX = RandomNumberGenerator.GetInt32(Width / 3, (2 * Width) / 3);
            var midY = RandomNumberGenerator.GetInt32(5, Height - 5);
            noiseLines.Append(
                $"<path d=\"M0,{y1} Q{midX},{midY} {Width},{y2}\" stroke=\"#d9364f\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.75\"/>");
        }

        var noiseDots = new StringBuilder();
        for (var i = 0; i < 20; i++)
        {
            var cx = RandomNumberGenerator.GetInt32(Width);
            var cy = RandomNumberGenerator.GetInt32(Height);
            noiseDots.Append($"<circle cx=\"{cx}\" cy=\"{cy}\" r=\"1\" fill=\"#c99\" opacity=\"0.6\"/>");
        }

        return $"""
            <svg xmlns="http://www.w3.org/2000/svg" width="{Width}" height="{Height}" viewBox="0 0 {Width} {Height}">
              <rect width="{Width}" height="{Height}" fill="#f0cccc"/>
              {noiseDots}
              {glyphs}
              {noiseLines}
            </svg>
            """;
    }
}
