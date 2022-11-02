import InfiniteScroll from "react-infinite-scroller";
import { Person } from "./Person";
import { useInfiniteQuery } from 'react-query';

const initialUrl = "https://swapi.dev/api/people/";
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfinitePeople() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
    "sw-people",
    ({ pageParam = initialUrl }) => fetchUrl(pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.next || undefined,
    }
  );
  return <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
      {data?.pages.map(pageData => {
        return pageData.results.map(person => {
          return  (<Person key={person.name} name={person.name} hairColor={person.hair_color} eyeColor={person.eye_color} />)
        })
      })}
    </InfiniteScroll>;
}
