import { PrismaClient } from "@prisma/client"
import fs from "fs"
import csv from "csv-parser"

const prisma = new PrismaClient()
async function main() {
  const data = []
  fs.createReadStream("./nutrition.csv")
    .pipe(csv())
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", async () => {
      const foods = data.map((row) => {
        return {
          foodId: row.id,
          foodName: row.name,
          calories: parseFloat(row.calories),
          fat: parseFloat(row.fat),
          carbohydrate: parseFloat(row.carbohydrate),
          proteins: parseFloat(row.proteins),
        };
      });
      await prisma.food.createMany({
        data: foods,
      });
    });
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
