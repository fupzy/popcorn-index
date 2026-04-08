using Utilities.GuidProvider;

namespace TestingUtilities.GuidProvider;

public sealed class MockGuidProvider : IGuidProvider
{
    private Queue<Guid> guids = [];

    public void NextGuids(IEnumerable<Guid> guids) => this.guids = new(guids);
    
    public Guid NewGuid()
    {
        if (this.guids.Count != 0)
        {
            return this.guids.Dequeue();
        }

        return Guid.NewGuid();
    }
}
