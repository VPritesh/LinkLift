using System.Text;

namespace LinkLift.Domain.Utilities;

public static class Base62Encoder
{
    private const string Alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public static string Encode(long value)
    {
        if (value < 0)
            throw new ArgumentOutOfRangeException(nameof(value), "Value must be non-negative.");

        if (value == 0)
            return Alphabet[0].ToString();

        var sb = new StringBuilder();
        while (value > 0)
        {
            var remainder = (int)(value % 62);
            sb.Append(Alphabet[remainder]);
            value /= 62;
        }

        var charArray = sb.ToString().ToCharArray();
        Array.Reverse(charArray);
        return new string(charArray);
    }

    public static long Decode(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Input string cannot be null or empty.", nameof(text));

        long result = 0;
        foreach (var c in text)
        {
            var index = Alphabet.IndexOf(c);
            if (index == -1)
                throw new ArgumentException($"Invalid Base62 character: {c}", nameof(text));

            result = result * 62 + index;
        }

        return result;
    }
}

