import { useEffect, useState } from "react";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";
import type { Category, CreateCategoryRequest } from "../types/Category";
import type { CreateProductRequest, Product } from "../types/Product";

type ModalType =
  | "category-create"
  | "category-edit"
  | "category-delete"
  | "product-create"
  | "product-edit"
  | "product-delete"
  | "product-restock"
  | null;

export default function ProductManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productBuyingPrice, setProductBuyingPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [restockQuantity, setRestockQuantity] = useState("");
  const [restockUnitCost, setRestockUnitCost] = useState("");
  const [restockSupplier, setRestockSupplier] = useState("");
  const [restockReason, setRestockReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoriesData, productsData] = await Promise.all([
        categoryService.getCategories(),
        productService.getProducts(),
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
    } catch {
      setError("Failed to load categories and products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetModal = () => {
    setModal(null);
    setSelectedCategory(null);
    setSelectedProduct(null);
    setCategoryName("");
    setProductName("");
    setProductPrice("");
    setProductBuyingPrice("");
    setProductStock("");
    setProductCategoryId("");
    setProductImageUrl("");
    setRestockQuantity("");
    setRestockUnitCost("");
    setRestockSupplier("");
    setRestockReason("");
    setProcessing(false);
    setModalError("");
  };

  const openCreateCategory = () => {
    setCategoryName("");
    setModalError("");
    setModal("category-create");
  };

  const openEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setModalError("");
    setModal("category-edit");
  };

  const openDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalError("");
    setModal("category-delete");
  };

  const openCreateProduct = () => {
    setProductName("");
    setProductPrice("");
    setProductBuyingPrice("");
    setProductStock("");
    setProductCategoryId(
      categories.length > 0 ? String(categories[0].id) : "",
    );
    setProductImageUrl("");
    setModalError("");
    setModal("product-create");
  };

  const openEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductPrice(String(product.price));
    setProductBuyingPrice(String(product.buyingPrice));
    setProductStock(String(product.stock));
    setProductCategoryId(String(product.categoryId));
    setProductImageUrl(product.imageUrl || "");
    setModalError("");
    setModal("product-edit");
  };

  const openDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalError("");
    setModal("product-delete");
  };

  const openRestockProduct = (product: Product) => {
    setSelectedProduct(product);
    setRestockQuantity("");
    setRestockUnitCost(String(product.buyingPrice));
    setRestockSupplier("");
    setRestockReason("");
    setModalError("");
    setModal("product-restock");
  };

  const getCategoryRequest = (): CreateCategoryRequest | null => {
    if (!categoryName.trim()) {
      setModalError("Category name is required.");
      return null;
    }

    return {
      name: categoryName.trim(),
    };
  };

  const getProductRequest = (): CreateProductRequest | null => {
    const price = Number(productPrice);
    const buyingPrice = Number(productBuyingPrice);
    const stock = Number(productStock);
    const categoryId = Number(productCategoryId);

    if (!productName.trim()) {
      setModalError("Product name is required.");
      return null;
    }

    if (!productPrice || Number.isNaN(price) || price < 0) {
      setModalError("Enter a valid selling price.");
      return null;
    }

    if (
      !productBuyingPrice ||
      Number.isNaN(buyingPrice) ||
      buyingPrice < 0
    ) {
      setModalError("Enter a valid buying price.");
      return null;
    }

    if (productStock === "" || Number.isNaN(stock) || stock < 0) {
      setModalError("Enter a valid stock quantity.");
      return null;
    }

    if (!productCategoryId || Number.isNaN(categoryId)) {
      setModalError("Select a category.");
      return null;
    }

    return {
      name: productName.trim(),
      price,
      buyingPrice,
      stock,
      categoryId,
      imageUrl: productImageUrl.trim(),
    };
  };

  const handleCreateCategory = async () => {
    const request = getCategoryRequest();

    if (!request) {
      return;
    }

    try {
      setProcessing(true);
      setModalError("");

      await categoryService.createCategory(request);
      await loadData();
      resetModal();
    } catch {
      setModalError("Failed to create category.");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) {
      return;
    }

    const request = getCategoryRequest();

    if (!request) {
      return;
    }

    try {
      setProcessing(true);
      setModalError("");

      await categoryService.updateCategory(selectedCategory.id, request);
      await loadData();
      resetModal();
    } catch {
      setModalError("Failed to update category.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) {
      return;
    }

    const categoryProducts = products.filter(
      (product) => product.categoryId === selectedCategory.id,
    );

    const productsInStock = categoryProducts.filter(
      (product) => product.stock > 0,
    );

    if (productsInStock.length > 0) {
      setModalError(
        "This category cannot be deleted because it has products that are still in stock.",
      );
      return;
    }

    try {
      setProcessing(true);
      setModalError("");

      await categoryService.deleteCategory(selectedCategory.id);
      await loadData();
      resetModal();
    } catch {
      setModalError("Failed to delete category.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateProduct = async () => {
    const request = getProductRequest();

    if (!request) {
      return;
    }

    try {
      setProcessing(true);
      setModalError("");

      await productService.createProduct(request);
      await loadData();
      resetModal();
    } catch {
      setModalError("Failed to create product.");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) {
      return;
    }

    const request = getProductRequest();

    if (!request) {
      return;
    }

    try {
      setProcessing(true);
      setModalError("");

      await productService.updateProduct(selectedProduct.id, request);
      await loadData();
      resetModal();
    } catch {
      setModalError("Failed to update product.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      setProcessing(true);
      setModalError("");

      await productService.deleteProduct(selectedProduct.id);
      await loadData();
      resetModal();
    } catch {
      setModalError("Failed to delete product.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRestockProduct = async () => {
    if (!selectedProduct) {
      return;
    }

    const quantity = Number(restockQuantity);
    const unitCost = Number(restockUnitCost);

    if (
      restockQuantity === "" ||
      Number.isNaN(quantity) ||
      quantity <= 0 ||
      !Number.isInteger(quantity)
    ) {
      setModalError("Enter a valid whole-number quantity.");
      return;
    }

    if (restockUnitCost === "" || Number.isNaN(unitCost) || unitCost < 0) {
      setModalError("Enter a valid unit cost.");
      return;
    }

    if (!restockReason.trim()) {
      setModalError("Restock reason is required.");
      return;
    }

    try {
      setProcessing(true);
      setModalError("");

      await productService.restockProduct({
        productId: selectedProduct.id,
        quantity,
        unitCost,
        supplier: restockSupplier.trim(),
        reason: restockReason.trim(),
      });

      await loadData();
      resetModal();
    } catch {
      setModalError("Failed to restock product.");
    } finally {
      setProcessing(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return (
      categories.find((category) => category.id === categoryId)?.name ||
      "Unknown"
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <p className="text-sm text-[#7a6258]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f5f0e8] p-4 sm:p-5">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#4a2c20]">
            Product Management
          </h1>
          <p className="mt-1 text-sm text-[#7a6258]">
            Manage categories, products, prices and inventory.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(280px,0.7fr)_minmax(0,2fr)]">
          <section className="min-w-0 self-start rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#eadfd7] px-4 py-3">
              <div>
                <h2 className="text-base font-bold text-[#4a2c20]">
                  Categories
                </h2>
                <p className="text-xs text-[#8b756a]">
                  {categories.length} categories
                </p>
              </div>

              <button
                onClick={openCreateCategory}
                className="rounded-lg bg-[#6b3f2a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4a2c20]"
              >
                + New
              </button>
            </div>

            <div className="overflow-hidden">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="border-b border-[#eadfd7] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wide text-[#8b756a]">
                    <th className="w-[12%] px-2 py-2.5">#</th>
                    <th className="w-[36%] px-2 py-2.5">Name</th>
                    <th className="w-[18%] px-2 py-2.5">ID</th>
                    <th className="w-[34%] px-2 py-2.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-[#8b756a]"
                      >
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr
                        key={category.id}
                        className="border-b border-[#f0e7e0] last:border-0"
                      >
                        <td className="px-2 py-2.5 text-xs text-[#7a6258]">
                          {index + 1}
                        </td>

                        <td className="truncate px-2 py-2.5 text-xs font-medium text-[#4a2c20]">
                          {category.name}
                        </td>

                        <td className="px-2 py-2.5 text-xs text-[#8b756a]">
                          {category.id}
                        </td>

                        <td className="px-2 py-2.5">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEditCategory(category)}
                              className="rounded-md border border-[#d8c8bd] px-2 py-1 text-[10px] font-medium text-[#6b3f2a] transition hover:bg-[#f5f0e8]"
                            >
                              Update
                            </button>

                            <button
                              onClick={() => openDeleteCategory(category)}
                              className="rounded-md border border-red-200 px-2 py-1 text-[10px] font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="min-w-0 rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#eadfd7] px-4 py-3">
              <div>
                <h2 className="text-base font-bold text-[#4a2c20]">Products</h2>
                <p className="text-xs text-[#8b756a]">
                  {products.length} products
                </p>
              </div>

              <button
                onClick={openCreateProduct}
                className="rounded-lg bg-[#6b3f2a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4a2c20]"
              >
                + New
              </button>
            </div>

            <div className="overflow-hidden">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="border-b border-[#eadfd7] bg-[#faf7f3] text-[11px] font-semibold uppercase tracking-wide text-[#8b756a]">
                    <th className="w-[5%] px-2 py-2.5">#</th>
                    <th className="w-[18%] px-2 py-2.5">Name</th>
                    <th className="w-[10%] px-2 py-2.5">Buy</th>
                    <th className="w-[10%] px-2 py-2.5">Sell</th>
                    <th className="w-[9%] px-2 py-2.5">Stock</th>
                    <th className="w-[15%] px-2 py-2.5">Category</th>
                    <th className="w-[7%] px-2 py-2.5">ID</th>
                    <th className="w-[26%] px-2 py-2.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-[#8b756a]"
                      >
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => (
                      <tr
                        key={product.id}
                        className="border-b border-[#f0e7e0] last:border-0"
                      >
                        <td className="px-2 py-2.5 text-xs text-[#7a6258]">
                          {index + 1}
                        </td>

                        <td className="truncate px-2 py-2.5 text-xs font-medium text-[#4a2c20]">
                          {product.name}
                        </td>

                        <td className="px-2 py-2.5 text-xs font-medium text-[#7a6258]">
                          KSh {product.buyingPrice.toLocaleString()}
                        </td>

                        <td className="px-2 py-2.5 text-xs font-medium text-[#4a2c20]">
                          KSh {product.price.toLocaleString()}
                        </td>

                        <td className="px-2 py-2">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              product.stock > 20
                                ? "bg-green-100 text-green-700"
                                : product.stock > 10
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td className="truncate px-2 py-2.5 text-xs text-[#7a6258]">
                          {getCategoryName(product.categoryId)}
                        </td>

                        <td className="px-2 py-2.5 text-xs text-[#8b756a]">
                          {product.id}
                        </td>

                        <td className="px-2 py-2.5">
                          <div className="flex flex-wrap justify-end gap-1">
                            <button
                              onClick={() => openEditProduct(product)}
                              className="rounded-md border border-[#d8c8bd] px-2 py-1 text-[10px] font-medium text-[#6b3f2a] transition hover:bg-[#f5f0e8]"
                            >
                              Update
                            </button>

                            <button
                              onClick={() => openRestockProduct(product)}
                              className="rounded-md border border-green-200 px-2 py-1 text-[10px] font-medium text-green-700 transition hover:bg-green-50"
                            >
                              Restock
                            </button>

                            <button
                              onClick={() => openDeleteProduct(product)}
                              className="rounded-md border border-red-200 px-2 py-1 text-[10px] font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          {modal === "category-create" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#4a2c20]">
                New Category
              </h2>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                  Category Name
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(event) =>
                    setCategoryName(event.currentTarget.value)
                  }
                  placeholder="e.g. Snacks"
                  autoFocus
                  className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                />
              </div>

              {modalError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {modalError}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetModal}
                  disabled={processing}
                  className="flex-1 rounded-lg border border-[#d8c8bd] py-2.5 text-sm font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateCategory}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-[#6b3f2a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a2c20] disabled:opacity-40"
                >
                  {processing ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          )}

          {modal === "category-edit" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#4a2c20]">
                Update Category
              </h2>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                  Category Name
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(event) =>
                    setCategoryName(event.currentTarget.value)
                  }
                  autoFocus
                  className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                />
              </div>

              {modalError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {modalError}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetModal}
                  disabled={processing}
                  className="flex-1 rounded-lg border border-[#d8c8bd] py-2.5 text-sm font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateCategory}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-[#6b3f2a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a2c20] disabled:opacity-40"
                >
                  {processing ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          )}

          {modal === "category-delete" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#4a2c20]">
                Delete Category
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#7a6258]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#4a2c20]">
                  {selectedCategory?.name}
                </span>
                ?
              </p>

              {selectedCategory && (
                <div className="mt-4 rounded-lg bg-[#f5f0e8] p-4 text-sm text-[#7a6258]">
                  Category ID:{" "}
                  <span className="font-semibold text-[#4a2c20]">
                    {selectedCategory.id}
                  </span>
                </div>
              )}

              {modalError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {modalError}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetModal}
                  disabled={processing}
                  className="flex-1 rounded-lg border border-[#d8c8bd] py-2.5 text-sm font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteCategory}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
                >
                  {processing ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}

          {modal === "product-create" && (
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#4a2c20]">
                New Product
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={productName}
                    onChange={(event) =>
                      setProductName(event.currentTarget.value)
                    }
                    placeholder="e.g. Coca Cola"
                    autoFocus
                    className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Selling Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={productPrice}
                      onChange={(event) =>
                        setProductPrice(event.currentTarget.value)
                      }
                      placeholder="350"
                      className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Buying Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={productBuyingPrice}
                      onChange={(event) =>
                        setProductBuyingPrice(event.currentTarget.value)
                      }
                      placeholder="280"
                      className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={productStock}
                      onChange={(event) =>
                        setProductStock(event.currentTarget.value)
                      }
                      placeholder="50"
                      className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Category
                    </label>

                    <select
                      value={productCategoryId}
                      onChange={(event) =>
                        setProductCategoryId(event.currentTarget.value)
                      }
                      className="w-full rounded-lg border border-[#d8c8bd] bg-white px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                    Image URL
                  </label>

                  <input
                    type="text"
                    value={productImageUrl}
                    onChange={(event) =>
                      setProductImageUrl(event.currentTarget.value)
                    }
                    placeholder="/images/products/product.jpg"
                    className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                  />
                </div>
              </div>

              {modalError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {modalError}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetModal}
                  disabled={processing}
                  className="flex-1 rounded-lg border border-[#d8c8bd] py-2.5 text-sm font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateProduct}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-[#6b3f2a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a2c20] disabled:opacity-40"
                >
                  {processing ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          )}

          {modal === "product-edit" && (
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#4a2c20]">
                Update Product
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={productName}
                    onChange={(event) =>
                      setProductName(event.currentTarget.value)
                    }
                    autoFocus
                    className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Selling Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={productPrice}
                      onChange={(event) =>
                        setProductPrice(event.currentTarget.value)
                      }
                      className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Buying Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={productBuyingPrice}
                      onChange={(event) =>
                        setProductBuyingPrice(event.currentTarget.value)
                      }
                      className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={productStock}
                      onChange={(event) =>
                        setProductStock(event.currentTarget.value)
                      }
                      className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Category
                    </label>

                    <select
                      value={productCategoryId}
                      onChange={(event) =>
                        setProductCategoryId(event.currentTarget.value)
                      }
                      className="w-full rounded-lg border border-[#d8c8bd] bg-white px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                    Image URL
                  </label>

                  <input
                    type="text"
                    value={productImageUrl}
                    onChange={(event) =>
                      setProductImageUrl(event.currentTarget.value)
                    }
                    className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                  />
                </div>
              </div>

              {modalError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {modalError}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetModal}
                  disabled={processing}
                  className="flex-1 rounded-lg border border-[#d8c8bd] py-2.5 text-sm font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateProduct}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-[#6b3f2a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a2c20] disabled:opacity-40"
                >
                  {processing ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          )}

          {modal === "product-restock" && (
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#4a2c20]">
                Restock Product
              </h2>

              <p className="mt-1 text-sm text-[#7a6258]">
                Add a new inventory batch for this product.
              </p>

              {selectedProduct && (
                <div className="mt-4 rounded-lg bg-[#f5f0e8] p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7a6258]">Product</span>
                    <span className="font-semibold text-[#4a2c20]">
                      {selectedProduct.name}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-[#7a6258]">Current Stock</span>
                    <span className="font-semibold text-[#4a2c20]">
                      {selectedProduct.stock}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={restockQuantity}
                      onChange={(event) =>
                        setRestockQuantity(event.currentTarget.value)
                      }
                      placeholder="50"
                      autoFocus
                      className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                      Unit Cost
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={restockUnitCost}
                      onChange={(event) =>
                        setRestockUnitCost(event.currentTarget.value)
                      }
                      placeholder="140"
                      className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                    Supplier
                  </label>

                  <input
                    type="text"
                    value={restockSupplier}
                    onChange={(event) =>
                      setRestockSupplier(event.currentTarget.value)
                    }
                    placeholder="e.g. ABC Distributors"
                    className="w-full rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4a2c20]">
                    Reason
                  </label>

                  <textarea
                    value={restockReason}
                    onChange={(event) =>
                      setRestockReason(event.currentTarget.value)
                    }
                    placeholder="e.g. Weekly stock replenishment"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[#d8c8bd] px-4 py-3 text-sm text-[#4a2c20] outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                  />
                </div>
              </div>

              {modalError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {modalError}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetModal}
                  disabled={processing}
                  className="flex-1 rounded-lg border border-[#d8c8bd] py-2.5 text-sm font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRestockProduct}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-[#6b3f2a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a2c20] disabled:opacity-40"
                >
                  {processing ? "Restocking..." : "Restock"}
                </button>
              </div>
            </div>
          )}

          {modal === "product-delete" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#4a2c20]">
                Delete Product
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#7a6258]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#4a2c20]">
                  {selectedProduct?.name}
                </span>
                ?
              </p>

              {selectedProduct && (
                <div className="mt-4 rounded-lg bg-[#f5f0e8] p-4 text-sm text-[#7a6258]">
                  <div className="flex justify-between">
                    <span>Product ID</span>
                    <span className="font-semibold text-[#4a2c20]">
                      {selectedProduct.id}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between">
                    <span>Current Stock</span>
                    <span className="font-semibold text-[#4a2c20]">
                      {selectedProduct.stock}
                    </span>
                  </div>
                </div>
              )}

              {modalError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {modalError}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetModal}
                  disabled={processing}
                  className="flex-1 rounded-lg border border-[#d8c8bd] py-2.5 text-sm font-semibold text-[#4a2c20] transition hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteProduct}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
                >
                  {processing ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}