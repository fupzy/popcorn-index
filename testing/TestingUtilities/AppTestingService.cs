using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
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


    public T? GetService<T>()
    {
        var serviceProvider = this.AppService?.WebApplication?.Services;
        if (serviceProvider == null)
        {
            return default;
        }

        return serviceProvider.GetService<T>();
    }

    public T GetRequiredService<T>()
        where T : notnull
    {
        var serviceProvider = this.AppService?.WebApplication?.Services ?? throw new InvalidOperationException("ServiceProvider is not initialized");

        return serviceProvider.GetRequiredService<T>();
    }

    public async Task Execute<TContext>(Func<TContext, Task> action)
        where TContext : DbContext
    {
        var provider = this.GetService<IServiceProvider>() ?? throw new InvalidOperationException();
        using var scope = provider.CreateScope();
        using var dbContext = scope.ServiceProvider.GetRequiredService<TContext>();
        await action(dbContext);
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
