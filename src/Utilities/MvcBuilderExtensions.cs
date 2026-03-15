using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;

namespace Utilities;

public static class MvcBuilderExtensions
{
    /// <summary>
    /// Scans all referenced assemblies in the application and adds any assembly containing
    /// a <see cref="ControllerBase"/> implementation as an <see cref="ApplicationPart"/> to the MVC builder.
    /// </summary>
    public static IMvcBuilder AddParts(this IMvcBuilder mvcBuilder)
    {
        var assemblies = Helpers.GetAllReferencedAssembliesWithTypeAssignableTo<ControllerBase>();

        foreach (var assembly in assemblies)
        {
            mvcBuilder.AddApplicationPart(assembly);
        }

        return mvcBuilder;
    }
}
