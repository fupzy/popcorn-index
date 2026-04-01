using MockFeature.Domain;

namespace MockFeature.Infrastructure;

internal sealed class ItemRepository : IItemRepository
{
    public IEnumerable<Item> GetAll()
    {
        return
        [
            new Item("Bonjour"),
            new Item("Hello"),
            new Item("Hola"),
        ];
    }
}
