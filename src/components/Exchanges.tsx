import { Avatar, Col, Collapse, Row, Typography, Empty, Spin } from 'antd';
import millify from 'millify';
import React, { useEffect } from 'react';
import { Loader } from '.';
import { Exchange, IExchangesData } from '../services/cryptoExchanges';

const { Text } = Typography;
const { Panel } = Collapse;

function Exchanges() {
  const [exchangesList, setExchangesList] = React.useState<Exchange[]>([]);
  const [isFetching, setIsFetching] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        // Note: Direct fetch without CORS proxy - requires backend support
        // For now, showing example with proper error handling
        const response = await fetch(
          'https://coinranking.com/api/v2/exchanges?offset=0&orderDirection=desc&referenceCurrencyUuid=yhjMzLPhuIDl&limit=100',
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data: IExchangesData = await response.json();

        if (data?.data?.exchanges) {
          setExchangesList(data.data.exchanges);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchanges data';
        setError(errorMessage);
        console.error('Error fetching exchanges:', err);
      } finally {
        setIsFetching(false);
      }
    }

    fetchData();
  }, []);

  if (isFetching) return <Loader />;

  if (error) {
    return (
      <Empty
        description={
          <div>
            <p>Failed to load exchanges</p>
            <p style={{ color: '#666', fontSize: '12px' }}>{error}</p>
            <p style={{ color: '#999', fontSize: '11px', marginTop: '10px' }}>
              Note: This API requires CORS proxy or backend support.
            </p>
          </div>
        }
      />
    );
  }

  if (!exchangesList || exchangesList.length === 0) {
    return <Empty description="No exchanges data available" />;
  }

  return (
    <>
      <Row>
        <Col span={6}>Exchanges</Col>
        <Col span={6}>24h Trade Volume</Col>
        <Col span={6}>Markets</Col>
        <Col span={6}>Change</Col>
      </Row>
      <Row>
        {exchangesList.map((exchange) => (
          <Col span={24} key={exchange.uuid}>
            <Collapse>
              <Panel
                key={exchange.uuid}
                showArrow={false}
                header={
                  <Row key={exchange.uuid} className="exchange-row">
                    <Col span={6}>
                      <Text>
                        <strong>{exchange.rank}.</strong>
                      </Text>
                      <Avatar className="exchange-image" src={exchange.iconUrl} />
                      <Text>
                        <strong>{exchange.name}</strong>
                      </Text>
                    </Col>
                    <Col span={6}>$ {millify(+exchange['24hVolume'])}</Col>
                    <Col span={6}>{millify(+exchange.numberOfMarkets)}</Col>
                    <Col span={6}>{millify(+exchange.marketShare)}%</Col>
                  </Row>
                }>
                <a href={exchange.coinrankingUrl} target="_blank" rel="noreferrer">
                  {exchange.name}
                </a>
              </Panel>
            </Collapse>
          </Col>
        ))}
      </Row>
    </>
  );
}

export default Exchanges;
