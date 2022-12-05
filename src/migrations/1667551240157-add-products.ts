import { connectToDb } from "../migrations-utils/db-connection";
import { Product, ProductDocument, ProductSchema } from "../schemas/product.schema"

export const up = async () => {
  const db = await connectToDb();
  const ProductModel = db.model("Product", ProductSchema)
  const numberOfProducts = 247;
  const product: ProductDocument = {
    name: "Test Product",
    description: "This is test product",
    price: "23.99",
    category: "test",
    images: ["test-image.png", "test-img.jpg"],
    tags: ["new", "product"],
  } as ProductDocument;
  let products: ProductDocument[] = []

  for (let index = 1; index <= numberOfProducts; index++) {
    const testProduct = {
      ...product,
      name: `${product.name} ${index}`,
      description: `${product.description} ${index}`,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    } as ProductDocument;

    products.push(testProduct)
  }

  await ProductModel.create(products)
}

export const down = async () => {
  const db = await connectToDb();
  const ProductModel = db.model("Product", ProductSchema)

  await ProductModel.deleteMany({ name: { $regex: /Test Product ([0-9]*)/g } })
}