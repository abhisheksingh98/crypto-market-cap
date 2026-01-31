import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ICryptoNewsDate, NewsCryptoQuery } from './cryptoNewsApi.types';

const cryptoNewsHeaders = {
  'x-rapidapi-host': import.meta.env.VITE_NEWS_API_HOST || 'news-api14.p.rapidapi.com',
  'x-rapidapi-key': import.meta.env.VITE_NEWS_API_KEY || '',
};

const baseUrl = 'https://news-api14.p.rapidapi.com';

const createRequest = (url: string) => ({ url, headers: cryptoNewsHeaders });

export const cryptoNewsApi = createApi({
  reducerPath: 'cryptoNewsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getCryptoNews: builder.query<ICryptoNewsDate, NewsCryptoQuery>({
      query: ({ newsCategory, count }) =>
        createRequest(
          `/v2/search/articles?query=${newsCategory}&language=en&limit=${count}`,
        ),
    }),
  }),
});

export const { useGetCryptoNewsQuery } = cryptoNewsApi;
