using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Authentication.Controllers;

/// <summary>
/// Declares the bearer requirement on the Swagger operations that actually carry an
/// <see cref="AuthorizeAttribute"/>, so anonymous endpoints such as login and register
/// are not advertised as protected.
/// </summary>
/// <remarks>
/// This is a document filter rather than an operation filter because an
/// <see cref="OpenApiSecuritySchemeReference"/> only serializes once it can resolve its
/// target against the host document — which operation filters do not have access to.
/// Built without it, the requirement is emitted as an empty object and Swagger UI sends
/// no credential at all.
/// </remarks>
internal sealed class AuthorizedOperationFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument document, DocumentFilterContext context)
    {
        var requirement = new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = []
        };

        var protectedRoutes = context.ApiDescriptions
            .Where(RequiresAuthorization)
            .Select(description => $"{description.HttpMethod}:/{description.RelativePath}")
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (document.Paths == null)
        {
            return;
        }

        foreach (var (path, pathItem) in document.Paths)
        {
            if (pathItem.Operations == null)
            {
                continue;
            }

            foreach (var (method, operation) in pathItem.Operations)
            {
                if (!protectedRoutes.Contains($"{method}:{path}"))
                {
                    continue;
                }

                operation.Responses ??= [];
                operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Unauthorized" });

                operation.Security = [requirement];
            }
        }
    }

    private static bool RequiresAuthorization(ApiDescription description)
    {
        var metadata = description.ActionDescriptor.EndpointMetadata;

        return metadata.OfType<IAuthorizeData>().Any() && !metadata.OfType<IAllowAnonymous>().Any();
    }
}
