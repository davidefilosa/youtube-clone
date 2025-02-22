import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
  "Film & Animation",
  "Autos & Vehicles",
  "Music",
  "Pets & Animals",
  "Sports",
  "Travel & Events",
  "Gaming",
  "People & Blogs",
  "Comedy",
  "Entertainment",
  "News & Politics",
  "Howto & Style",
  "Education",
  "Science & Technology",
  "Nonprofits & Activism",
];

async function main() {
  console.log("seeding categories");

  try {
    categoryNames.forEach(
      async (name) => await db.insert(categories).values({ name })
    );

    console.log("seeding success!");
  } catch (error) {
    console.log("error seding categories", error);
    process.exit(1);
  }
}

main();
