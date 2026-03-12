using System.Reflection;
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
    //public static IMvcBuilder AddParts(this IMvcBuilder mvcBuilder)
    //{
    //    foreach (var assembly in Helpers.GetAllReferencedAssembliesWithTypeAssignableTo<ControllerBase>())
    //    {
    //        mvcBuilder.AddApplicationPart(assembly);
    //    }

    //    return mvcBuilder;
    //}

    public static IMvcBuilder AddParts(this IMvcBuilder mvcBuilder)
    {
        var assemblies = Helpers.GetAllReferencedAssembliesWithTypeAssignableTo<ControllerBase>();

        foreach (var assembly in assemblies)
        {
            Console.WriteLine($"[MvcBuilderExtensions] Adding ApplicationPart from assembly: {assembly.FullName}");
            mvcBuilder.AddApplicationPart(assembly);
        }

        return mvcBuilder;
    }
}
