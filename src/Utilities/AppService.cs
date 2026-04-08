using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Utilities.Extensions;

namespace Utilities;

public sealed class AppService
{
    public const string CorsPolicy = "enableAll";

    public WebApplicationBuilder? WebApplicationBuilder { get; private set; }

    public WebApplication? WebApplication { get; private set; }

    public static async Task RunApplication(string[] args)
    {
        var appService = new AppService();

        appService.Init(args);
        appService.Build();
        appService.Configure();

        await appService.ExecuteBeforeRunImplementations();

        await appService.RunAsync();
    }

    public void Init(string[] args)
    {
        Helpers.ReadEnvFileIfExists();

        var builder = WebApplication.CreateBuilder(args);

        builder.Configuration
            .SetBasePath(Helpers.GetConfigFilesFolder())
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddCommandLine(args);

        builder.Services
            .AddApiVersioning(options =>
            {
                options.ReportApiVersions = true;
            })
            .AddMvc()
            .AddApiExplorer(options =>
            {
                options.SubstituteApiVersionInUrl = true;
            });

        builder.Services
            .AddEndpointsApiExplorer()
            .AddProblemDetails()
            .AddSwaggerGen()
            .AddHttpLogging(options => options.LoggingFields = HttpLoggingFields.All);

        var mvcBuilder = builder.Services.AddControllers().AddJsonOptions(j => j.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
        mvcBuilder.AddParts();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicy,
                policy =>
                {
                    policy.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
                });
        });

        builder.Services
            .AddApplicationServices<IServicesRegistrator>(builder.Configuration)
            .AddBeforeRunImplementations(builder.Configuration);

        this.WebApplicationBuilder = builder;
    }

    public void Build()
    {
        if (this.WebApplicationBuilder == null)
        {
            return;
        }

        this.WebApplication = this.WebApplicationBuilder.Build();
    }

    public void Configure()
    {
        if (this.WebApplication == null)
        {
            return;
        }

        this.WebApplication
        .UseCors(CorsPolicy)
        .UseHttpLogging()
        .UseExceptionHandler()
        .UseStatusCodePages();

        this.WebApplication.MapControllers();

        this.WebApplication
            .UseSwagger()
            .UseSwaggerUI(options =>
            {
                options.DocumentTitle = "Popcorn Index";
            });
    }

    public async Task ExecuteBeforeRunImplementations()
    {
        if (this.WebApplication != null)
        {
            using var scope = this.WebApplication.Services.CreateScope();

            var beforeRunImplementations = scope.ServiceProvider.GetServices<IBeforeRun>();
            foreach (var beforeRunImplementation in beforeRunImplementations)
            {
                await beforeRunImplementation.Execute();
            }
        }
    }

    public Task RunAsync() => this.WebApplication?.RunAsync() ?? Task.CompletedTask;
}
