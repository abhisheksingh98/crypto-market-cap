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

  if (!cryptoNews?.value && !cryptoNews?.data) {
    return <Empty description="No news available for this category" />;
  }

  // Support both old (value) and new (data) API response structures
  const newsArticles = cryptoNews.data || cryptoNews.value || [];

  if (newsArticles.length === 0) {
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
      {newsArticles.map((news: any, index: number) => {
        // Handle both old and new API response formats
        const title = news.title || news.name;
        const description = news.description || news.excerpt || '';
        const imageUrl = news.thumbnail || news?.image?.thumbnail?.contentUrl || demoImage;
        const providerName = news.source || news.provider?.[0]?.name || 'Unknown';
        const providerImage = news.provider?.[0]?.image?.thumbnail?.contentUrl || demoImage;
        const publishedDate = news.published_at || news.datePublished;

        return (
          <Col xs={24} sm={12} lg={8} key={news.url || index}>
            <Card hoverable className="news-card">
              <a href={news.url} target="_blank" rel="noreferrer">
                <div className="news-image-container">
                  <Title className="news-title" level={4}>
                    {title && title.length > 50 ? `${title.substring(0, 50)}...` : title}
                  </Title>
                </div>
                <div className="news-content">
                  <img src={imageUrl} alt={title || 'news'} />
                  <p>
                    {description && description.length > 100
                      ? `${description.substring(0, 100)}...`
                      : description}
                  </p>
                </div>
                <div className="provider-container">
                  <div>
                    <Avatar
                      src={providerImage}
                      alt="news"
                    />
                    <Text className="provider-name">{providerName}</Text>
                  </div>
                  {publishedDate && <Text>{moment(publishedDate).startOf('s').fromNow()}</Text>}
                </div>
              </a>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default News;
