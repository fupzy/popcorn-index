using Microsoft.AspNetCore.TestHost;
using Utilities;

namespace TestingUtilities;

public sealed class AppTestingService
{
    public AppService? AppService { get; private set; }

    public TestServer? TestServer { get; private set; }

    public HttpClient? TestClient { get; private set; }

    public void Init(string[] args)
    {
        this.AppService = new AppService();
        this.AppService.Init(args);

        var builder = this.AppService.WebApplicationBuilder;
        if (builder != null)
        {
            builder.Services.AddApplicationServices<ITestingServicesRegistrator>(builder.Configuration);

            builder.WebHost.UseTestServer();
        }

        this.AppService.Build();
        this.AppService.Configure();

        this.TestServer = this.AppService.WebApplication?.GetTestServer();
    }

    public async Task StartAsync()
    {
        if (this.AppService != null && this.AppService.WebApplication != null)
        {
            await this.AppService.ExecuteBeforeRunImplementations();
            await this.AppService.WebApplication.StartAsync();
        }

        this.TestClient = this.TestServer?.CreateClient();
    }

    public async ValueTask DisposeAsync()
    {
        this.TestClient?.Dispose();
        this.TestClient = null;

        // Stop the web application if it was started
        if (this.AppService != null && this.AppService.WebApplication != null)
        {
            try
            {
                await this.AppService.WebApplication.StopAsync();
            }
            catch
            {
                // Nothing to do
            }
        }

        this.TestServer?.Dispose();
        this.TestServer = null;

        this.AppService = null;
    }

    public void Dispose()
    {
        this.DisposeAsync().AsTask().GetAwaiter().GetResult();
    }
}
