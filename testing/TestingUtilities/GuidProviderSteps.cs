using Reqnroll;
using Reqnroll.Assist;
using Utilities.GuidProvider;

namespace TestingUtilities;

[Binding]
public sealed class GuidProviderSteps(ServiceTestingSteps steps)
{
    [Given("the GUID provider next ids are")]
    public void GivenTheGuidProviderNextIdsAre(DataTable dataTable)
    {
        var guids = new List<Guid>();

        foreach (var row in dataTable.Rows)
        {
            guids.Add(row.GetGuid("Id"));
        }

        var mockGuidProvider = steps.GetRequiredService<IGuidProvider>() as MockGuidProvider;
        mockGuidProvider?.NextGuids(guids);
    }
}
