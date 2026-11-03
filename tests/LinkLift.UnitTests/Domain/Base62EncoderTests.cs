using FluentAssertions;
using LinkLift.Domain.Utilities;

namespace LinkLift.UnitTests.Domain;

public class Base62EncoderTests
{
    [Theory]
    [InlineData(0, "0")]
    [InlineData(1, "1")]
    [InlineData(61, "Z")]
    [InlineData(62, "10")]
    [InlineData(1000000, "4c92")]
    public void Encode_ShouldProduceExpectedBase62(long value, string expected)
    {
        var result = Base62Encoder.Encode(value);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("0", 0)]
    [InlineData("1", 1)]
    [InlineData("Z", 61)]
    [InlineData("10", 62)]
    [InlineData("4c92", 1000000)]
    public void Decode_ShouldProduceExpectedNumber(string text, long expected)
    {
        var result = Base62Encoder.Decode(text);
        result.Should().Be(expected);
    }

    [Fact]
    public void ReservedKeywords_ShouldIdentifySystemKeywords()
    {
        ReservedKeywords.IsReserved("api").Should().BeTrue();
        ReservedKeywords.IsReserved("swagger").Should().BeTrue();
        ReservedKeywords.IsReserved("health").Should().BeTrue();
        ReservedKeywords.IsReserved("summer-sale").Should().BeFalse();
        ReservedKeywords.IsReserved("🚀").Should().BeFalse();
    }
}

