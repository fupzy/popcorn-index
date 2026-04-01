using Reqnroll;

namespace TestingUtilities;

[Binding]
public class ServiceTestingSteps(AppTestingService appTestingService, ScenarioContext scenarioContext)
{
    public const int HookOrder = HookAttribute.DefaultOrder - 500;

    public const string TargetTag = "integration";

    public AppTestingService AppTestingService => appTestingService;

    /// <summary>
    /// Command line arguments that will be passed to the tested application.
    /// </summary>
    public List<string> Args { get; } = [];

    [BeforeScenario(TargetTag, Order = HookOrder)]
    public Task ServiceInitializationAndStart() => this.GivenTheServiceInitializedAndStarted();

    [AfterScenario]
    public void DisposeTestingService()
    {
        this.AppTestingService.Dispose();
        Environment.SetEnvironmentVariable("APPSETTINGS_FOLDER", string.Empty);
    }

    [Given(@"the service initialized")]
    public void GivenTheServiceInitialized()
    {
        this.SetupCommandLineArguments();
        this.AppTestingService.Init(this.Args.ToArray());
    }

    [Given(@"the service initialized and started")]
    public async Task GivenTheServiceInitializedAndStarted()
    {
        this.GivenTheServiceInitialized();

        await this.AppTestingService.StartAsync();
    }

    /// <summary>
    /// Builds command-line arguments from Reqnroll tags formatted as <c>arg:key=value</c>.
    /// </summary>
    /// <remarks>
    /// Extracts tags from both feature and scenario, keeping only those starting with <c>arg:</c>.
    /// Each tag is converted into a CLI argument <c>--key=value</c> and added to <c>Args</c>.
    /// 
    /// If duplicate keys exist, the last one wins (scenario overrides feature).
    /// Values containing '=' are preserved.
    /// 
    /// Example:
    /// <code>
    /// @arg:env=dev
    /// @arg:url=https://test.com
    /// </code>
    /// Produces:
    /// <code>
    /// --env=dev
    /// --url=https://test.com
    /// </code>
    /// </remarks>
    private void SetupCommandLineArguments()
    {
        var args = new Dictionary<string, string>();

        // Tags on scenario can override tags on feature
        foreach (var tag in scenarioContext.ScenarioInfo.CombinedTags.Concat(scenarioContext.ScenarioInfo.Tags).Where(t => t.StartsWith("arg:")))
        {
            var value = tag.Substring(4);
            var parts = value.Split('=');
            if (parts.Length >= 1)
            {
                args[parts[0]] = string.Join("=", parts.Skip(1));
            }
        }

        foreach (var arg in args)
        {
            this.Args.Add($"--{arg.Key}={arg.Value}");
        }
    }
}
