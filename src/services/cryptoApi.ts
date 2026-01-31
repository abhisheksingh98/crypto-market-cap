import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Coinranking } from './cryptoApi.types';
import { CryptoDetailCoin } from './cryptoApiCoin.types';
import { CryptoHistory } from './cryptoApiHistory.types';
import { IExchangesData } from './cryptoExchanges';

export enum Time {
  Hours = '3h',
  Day = '24h',
  Week = '7d',
  Month = '30d',
  Year = '1y',
  ThreeMonths = '3m',
  ThreeYears = '3y',
  FiveYears = '5y',
}

type CoinHistoryType = {
  coinId: string | undefined;
  timePeriod: Time;
};

const cryptoApiHeaders = {
  'X-RapidAPI-Host': import.meta.env.VITE_CRYPTO_API_HOST || 'coinranking1.p.rapidapi.com',
  'X-RapidAPI-Key': import.meta.env.VITE_CRYPTO_API_KEY || '',
};

const baseUrl = 'https://coinranking1.p.rapidapi.com/';

const createRequest = (url: string) => ({ url, headers: cryptoApiHeaders });

export const cryptoApi = createApi({
  reducerPath: 'cryptoApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  endpoints: (builder) => ({
    getCryptos: builder.query<Coinranking, number>({
      query: (count) => createRequest(`/coins?limit=${count}`),
    }),
    getCryptoDetails: builder.query<CryptoDetailCoin, string | undefined>({
      query: (coinId) => createRequest(`/coin/${coinId}`),
    }),
    getCryptoHistory: builder.query<CryptoHistory, CoinHistoryType>({
      query: ({ coinId, timePeriod }) =>
        createRequest(`/coin/${coinId}/history?timePeriod=${timePeriod}`),
    }),
    getExchanges: builder.query<IExchangesData, void>({
      query: () => createRequest('/exchanges?limit=100'),
    }),
    getReferenceCurrencies: builder.query<any, void>({
      query: () => createRequest('/reference-currencies?types[]=fiat&limit=100'),
    }),
    getCryptoPrice: builder.query<any, { coinId: string; referenceCurrencyUuid: string }>({
      query: ({ coinId, referenceCurrencyUuid }) =>
        createRequest(`/coin/${coinId}?referenceCurrencyUuid=${referenceCurrencyUuid}`),
    }),
  }),
});

export const {
  useGetCryptosQuery,
  useGetCryptoDetailsQuery,
  useGetCryptoHistoryQuery,
  useGetExchangesQuery,
  useGetReferenceCurrenciesQuery,
  useGetCryptoPriceQuery,
} = cryptoApi;
