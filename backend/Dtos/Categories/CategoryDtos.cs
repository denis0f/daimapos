namespace backend.Dtos.Categories;

public class CategoryDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
}