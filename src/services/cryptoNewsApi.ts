import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ICryptoNewsDate, NewsCryptoQuery } from './cryptoNewsApi.types';

const cryptoNewsHeaders = {
  'X-BingApis-SDK': 'true',
  'X-RapidAPI-Host': import.meta.env.VITE_NEWS_API_HOST || 'bing-news-search1.p.rapidapi.com',
  'X-RapidAPI-Key': import.meta.env.VITE_NEWS_API_KEY || '',
};

const baseUrl = 'https://bing-news-search1.p.rapidapi.com';

const createRequest = (url: string) => ({ url, headers: cryptoNewsHeaders });

export const cryptoNewsApi = createApi({
  reducerPath: 'cryptoNewsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getCryptoNews: builder.query<ICryptoNewsDate, NewsCryptoQuery>({
      query: ({ newsCategory, count }) =>
        createRequest(
          `/news/search?q=${newsCategory}&safeSearch=Off&textFormat=Raw&freshness=Day&count=${count}`,
        ),
    }),
  }),
});

export const { useGetCryptoNewsQuery } = cryptoNewsApi;
