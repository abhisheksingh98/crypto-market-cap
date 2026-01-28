import {
  CheckOutlined,
  DollarCircleOutlined,
  ExclamationCircleOutlined,
  FundOutlined,
  MoneyCollectOutlined,
  NumberOutlined,
  StopOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Col, Row, Select, Typography } from 'antd';
import HTMLReactParser from 'html-react-parser';
import millify from 'millify';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Time, useGetCryptoDetailsQuery, useGetCryptoHistoryQuery } from '../services/cryptoApi';
import LineChart from './LineChart';

type CryptoRouteParams = {
  coinId: string;
};

type CryptoTimeType = keyof typeof Time;

const { Title, Text } = Typography;
const { Option } = Select;

function CryptoDetails(): JSX.Element {
  const { coinId } = useParams<CryptoRouteParams>();
  
  if (!coinId) {
    return (
      <Col className="coin-detail-container">
        <Title level={2}>Error: Cryptocurrency not found</Title>
        <p>Please select a valid cryptocurrency from the list.</p>
      </Col>
    );
  }

  const [timePeriod, setTimePeriod] = React.useState<Time>(Time.Week);
  const { data, isFetching } = useGetCryptoDetailsQuery(coinId);
  const { data: coinHistory } = useGetCryptoHistoryQuery({ coinId, timePeriod });
  const cryptoDetails = data?.data?.coin;
  const slug = `${cryptoDetails?.name.split(' ')[0]}-${cryptoDetails?.symbol}`.toLowerCase();
  const time = Object.keys(Time) as Array<CryptoTimeType>;

  const stats = [
    {
      title: 'Price to USD',
      value: `$ ${cryptoDetails?.price && millify(Number(cryptoDetails?.price))}`,
      icon: <DollarCircleOutlined />,
    },
    { title: 'Rank', value: cryptoDetails?.rank, icon: <NumberOutlined /> },
    {
      title: '24h Volume',
      value: `$ ${cryptoDetails?.['24hVolume'] && millify(Number(cryptoDetails?.['24hVolume']))}`,
      icon: <ThunderboltOutlined />,
    },
    {
      title: 'Market Cap',
      value: `$ ${cryptoDetails?.marketCap && millify(Number(cryptoDetails?.marketCap))}`,
      icon: <DollarCircleOutlined />,
    },
    {
      title: 'All-time-high(daily avg.)',
      value: `$ ${
        cryptoDetails?.allTimeHigh?.price && millify(Number(cryptoDetails?.allTimeHigh?.price))
      }`,
      icon: <TrophyOutlined />,
    },
  ];

  const genericStats = [
    { title: 'Number Of Markets', value: cryptoDetails?.numberOfMarkets, icon: <FundOutlined /> },
    {
      title: 'Number Of Exchanges',
      value: cryptoDetails?.numberOfExchanges,
      icon: <MoneyCollectOutlined />,
    },
    {
      title: 'Aprroved Supply',
      value: cryptoDetails?.supply?.confirmed ? <CheckOutlined /> : <StopOutlined />,
      icon: <ExclamationCircleOutlined />,
    },
    {
      title: 'Total Supply',
      value: `$ ${cryptoDetails?.supply?.total && millify(Number(cryptoDetails?.supply?.total))}`,
      icon: <ExclamationCircleOutlined />,
    },
    {
      title: 'Circulating Supply',
      value: `$ ${
        cryptoDetails?.supply?.circulating && millify(Number(cryptoDetails?.supply?.circulating))
      }`,
      icon: <ExclamationCircleOutlined />,
    },
  ];

  return (
    <Col className="coin-detail-container">
      <Col className="coin-heading-container">
        <Title level={2} className="coin-name">
          {cryptoDetails?.name} {cryptoDetails && `(${slug})`} Price
        </Title>
        <p>
          {cryptoDetails?.name} live price in US dollars. View value statistics, market cap and
          supply.
        </p>
      </Col>
      <Select
        defaultValue={Time.Weak as CryptoTimeType & null}
        className="select-timeperiod"
        placeholder="Select Time Period"
        onChange={(value: CryptoTimeType) => setTimePeriod(Time[value])}>
        {time.map((key) => (
          <Option key={key}>{Time[key]}</Option>
        ))}
      </Select>
      {cryptoDetails && coinHistory && (
        <LineChart
          coinHistory={coinHistory}
          currentPrice={millify(Number(cryptoDetails?.price))}
          coinName={cryptoDetails?.name}
        />
      )}

      <Col className="stats-container">
        <Col className="coin-value-statistics">
          <Col className="coin-value-statistics-heading">
            <Title level={3} className="coin-detailes-heading">
              {cryptoDetails?.name} Value Statistics
            </Title>
            <p>An overview showing the stats of {cryptoDetails?.name}</p>
          </Col>
          {stats.map(({ icon, title, value }) => (
            <Col className="coin-stats" key={title}>
              <Col className="coin-stats-name">
                <Text>{icon}</Text>
                <Text>{title}</Text>
              </Col>
              <Text className="stats">{value}</Text>
            </Col>
          ))}
        </Col>
        <Col className="other-stats-info">
          <Col className="coin-value-statistics-heading">
            <Title level={3} className="coin-detailes-heading">
              Other Statistics
            </Title>
            <p>An overview showing the stats of all cryptocurrencies</p>
          </Col>
          {genericStats.map(({ icon, title, value }) => (
            <Col className="coin-stats" key={title}>
              <Col className="coin-stats-name">
                <Text>{icon}</Text>
                <Text>{title}</Text>
              </Col>
              <Text className="stats">{value}</Text>
            </Col>
          ))}
        </Col>
      </Col>
      <Col className="coin-desc-link">
        <Row className="coin-desc">
          <Title level={3} className="coin-details-heading">
            What is {cryptoDetails?.name}
            {cryptoDetails && HTMLReactParser(cryptoDetails?.description)}
          </Title>
        </Row>
        <Col className="coin-links">
          <Title level={3} className="coin-details-heading">
            {cryptoDetails?.name} Links
          </Title>
          {cryptoDetails?.links.map((link) => (
            <Row className="coin-link" key={link.url}>
              <Title level={5} className="link-name">
                {link.type}
              </Title>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.name}
              </a>
            </Row>
          ))}
        </Col>
      </Col>
    </Col>
  );
}

export default CryptoDetails;
