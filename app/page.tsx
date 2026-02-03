import HeroSlider from '@/components/HeroSlider';
import MovieRow from '@/components/MovieRow';
import { getHomepageData, getMovieDetail, HomeSection, Subject } from '@/lib/api';
import { getDracinHome, getDracinDetail, DramaboxItem } from '@/lib/dramabox';

export default async function Home() {
  console.log("Fetching homepage data...");
  let data;
  let dracinData: DramaboxItem[] = [];

  try {
    // Fetch both datasets in parallel
    const [homeData, dracinRes] = await Promise.all([
      getHomepageData(),
      getDracinHome(1, 10) // Fetch top 10 Dracin items
    ]);
    data = homeData;
    dracinData = dracinRes;
  } catch (e) {
    console.error("Error generating homepage:", e);
    return (
      <div className="pt-32 text-center text-red-500 px-4">
        <h2 className="text-xl font-bold mb-2">Error loading data</h2>
        <p className="text-sm font-mono bg-black/50 p-4 rounded inline-block max-w-full overflow-auto">
          {e instanceof Error ? e.message : String(e)}
        </p>
      </div>
    );
  }

  // Use operatingList if available, otherwise fallback to homeList
  let contentList = data.operatingList || data.homeList;

  if (!contentList) {
    contentList = [];
  }

  // Map Dracin Data to Subject format
  if (dracinData.length > 0) {
    const dracinSection: HomeSection = {
      type: 'SUBJECTS_MOVIE', // Reuse existing type for rendering
      title: 'Latest Dracin', // Title for the new row
      subjects: dracinData.map(d => ({
        subjectId: d.id.toString(),
        subjectType: 3, // Custom type
        title: d.name,
        description: d.introduction,
        releaseDate: "",
        genre: d.tags.join(", "),
        cover: { url: d.cover, width: 300, height: 450 },
        image: { url: d.cover, width: 300, height: 450 },
        countryName: "China",
        imdbRatingValue: "N/A",
        detailPath: "",
        isDracin: true
      }))
    };

    // Insert Dracin section after the first movie section (usually index 1)
    if (contentList.length > 1) {
      contentList.splice(1, 0, dracinSection);
    } else {
      contentList.push(dracinSection);
    }
  }

  if (contentList.length === 0) {
    return <div className="pt-32 text-white text-center">No Content Available</div>;
  }


  const bannerSection = contentList.find((s) => s.type === 'BANNER');
  let bannerItems = bannerSection?.banner?.items || bannerSection?.subjects || [];

  return (
    <main className="relative pb-16">
      {/* Hero Section */}
      {bannerItems.length > 0 && <HeroSlider items={bannerItems} />}

      {/* Movie Rows */}
      <div className="flex flex-col gap-2 -mt-16 md:-mt-32 relative z-10 pl-0 md:pl-0">
        {contentList.map((section, index) => {
          if (section.type === 'SUBJECTS_MOVIE' && section.subjects && section.subjects.length > 0) {
            const isDracinSection = section.title === 'Latest Dracin';
            return (
              <MovieRow
                key={`${section.title}-${index}`}
                title={section.title}
                movies={section.subjects}
                headerContent={undefined}
              />
            );
          }
          return null;
        })}
      </div>
    </main>
  );
}
