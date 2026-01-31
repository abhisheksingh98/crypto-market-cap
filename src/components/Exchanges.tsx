import { Avatar, Col, Collapse, Row, Typography, Empty } from 'antd';
import millify from 'millify';
import React from 'react';
import { Loader } from '.';
import { useGetExchangesQuery } from '../services/cryptoApi';

const { Text } = Typography;
const { Panel } = Collapse;

function Exchanges() {
  const { data: exchangesData, isFetching, error } = useGetExchangesQuery();

  if (isFetching) return <Loader />;

  if (error) {
    return (
      <Empty
        description={
          <div>
            <p>Failed to load exchanges</p>
            <p style={{ color: '#666', fontSize: '12px' }}>
              The exchanges API may be temporarily unavailable. Please try again later.
            </p>
          </div>
        }
      />
    );
  }

  const exchangesList = exchangesData?.data?.exchanges || [];

  if (exchangesList.length === 0) {
    return <Empty description="No exchanges data available" />;
  }

  return (
    <>
      <Row>
        <Col span={6}>Exchanges</Col>
        <Col span={6}>24h Trade Volume</Col>
        <Col span={6}>Markets</Col>
        <Col span={6}>Market Share</Col>
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
