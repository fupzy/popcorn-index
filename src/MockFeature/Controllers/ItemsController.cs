using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using MockFeature.Domain;

namespace MockFeature.Controllers;

[ApiController]
[ApiVersion(1.0)]
[Route("v{version:apiVersion}/items")]
[ApiExplorerSettings(GroupName="v1")]
public sealed class ItemsController(IItemRepository itemRepository): ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Item>> GetValues()
    {
        var items = itemRepository.GetAll();
        return this.Ok(items);
    }
}
