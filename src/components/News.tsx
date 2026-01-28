import { Avatar, Card, Col, Row, Select, Typography, Empty, Spin } from 'antd';
import moment from 'moment';
import React from 'react';
import { useGetCryptosQuery } from '../services/cryptoApi';
import { useGetCryptoNewsQuery } from '../services/cryptoNewsApi';
import Loader from './Loader';

type NewsProps = {
  simplified?: boolean;
};

const { Text, Title } = Typography;
const { Option } = Select;

const demoImage = 'https://coinrevolution.com/wp-content/uploads/2020/06/cryptonews.jpg';

function News({ simplified }: NewsProps): JSX.Element {
  const [newsCategory, setNewsCategory] = React.useState<string>('Cryptocurrency');
  const { data: cryptoNews, isLoading, error } = useGetCryptoNewsQuery({
    newsCategory,
    count: simplified ? 6 : 12,
  });
  const { data } = useGetCryptosQuery(100);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Empty
        description={
          <div>
            <p>Failed to load news</p>
            <p style={{ color: '#666', fontSize: '12px' }}>
              The news API may be temporarily unavailable. Please try again later.
            </p>
          </div>
        }
      />
    );
  }

  if (!cryptoNews?.value || cryptoNews.value.length === 0) {
    return <Empty description="No news available for this category" />;
  }

  return (
    <Row gutter={[24, 24]}>
      {!simplified && (
        <Col span={24}>
          <Select
            showSearch
            className="select-news"
            placeholder="Select a Crypto"
            optionFilterProp="children"
            onChange={(value) => setNewsCategory(value)}
            filterOption={(input, option) =>
              typeof option?.children === 'undefined'
                ? false
                : option.children.join().toLowerCase().indexOf(input.toLowerCase()) >= 0
            }>
            <Option value="Cryptocurrency">Cryptocurrency</Option>
            {data?.data?.coins.map((coin) => (
              <Option value={coin.name} key={coin.uuid}>
                {coin.name}
              </Option>
            ))}
          </Select>
        </Col>
      )}
      {cryptoNews.value.map((news) => (
        <Col xs={24} sm={12} lg={8} key={news.name}>
          <Card hoverable className="news-card">
            <a href={news.url} target="_blank" rel="noreferrer">
              <div className="news-image-container">
                <Title className="news-title" level={4}>
                  {news.name.length > 50 ? `${news.name.substring(0, 50)}...` : news.name}
                </Title>
              </div>
              <div className="news-content">
                <img src={news?.image?.thumbnail?.contentUrl || demoImage} alt={news.name} />
                <p>
                  {news.description.length > 100
                    ? `${news.description.substring(0, 100)}...`
                    : news.description}
                </p>
              </div>
              <div className="provider-container">
                <div>
                  <Avatar
                    src={news.provider[0]?.image?.thumbnail?.contentUrl || demoImage}
                    alt="news"
                  />
                  <Text className="provider-name">{news.provider[0]?.name}</Text>
                </div>
                <Text>{moment(news.datePublished).startOf('s').fromNow()}</Text>
              </div>
            </a>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default News;
