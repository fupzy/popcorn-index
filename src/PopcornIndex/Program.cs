using System.Text.Json.Serialization;
using Microsoft.AspNetCore.HttpLogging;
using Utilities;

var builder = WebApplication.CreateBuilder(args);

Helpers.ReadEnvFileIfExists();

builder.Configuration
    .SetBasePath(Helpers.GetConfigFilesFolder())
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

var corsPolicyName = "enableAll";

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName,
        policy =>
        {
            policy.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
        });
});

builder.Services
    .AddApplicationServices<IServicesRegistrator>(builder.Configuration)
    .AddBeforeRunImplementations(builder.Configuration);

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

var app = builder.Build();

app
    .UseCors(corsPolicyName)
    .UseHttpLogging()
    .UseExceptionHandler()
    .UseStatusCodePages();

app.MapControllers();

app
    .UseSwagger()
    .UseSwaggerUI(options =>
        {
            options.DocumentTitle = "Popcorn Index";
        });

if (app != null)
{
    using var scope = app.Services.CreateScope();
    var beforeRunImplementations = scope.ServiceProvider.GetServices<IBeforeRun>();
    foreach (var beforeRunImplementation in beforeRunImplementations)
    {
        await beforeRunImplementation.Execute();
    }
}

app?.Run();
