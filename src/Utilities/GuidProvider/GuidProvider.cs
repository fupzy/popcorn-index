namespace Utilities.GuidProvider;

public sealed class GuidProvider: IGuidProvider
{
    public Guid NewGuid() => Guid.NewGuid();
}
