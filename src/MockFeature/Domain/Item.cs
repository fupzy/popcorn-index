namespace MockFeature.Domain;

public sealed class Item(string name)
{
    public string Name { get; } = name;
}
