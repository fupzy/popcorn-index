namespace MockFeature.Domain;

public interface IItemRepository
{
    IEnumerable<Item> GetAll();
}
