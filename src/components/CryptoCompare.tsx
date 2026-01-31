import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Typography, Statistic, Spin, Table, Switch } from 'antd';
import { Line } from 'react-chartjs-2';
import millify from 'millify';
import HTMLReactParser from 'html-react-parser';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from 'chart.js';

import { useGetCryptosQuery, useGetCryptoDetailsQuery, useGetCryptoHistoryQuery, Time } from '../services/cryptoApi';
import { Loader } from '.';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const { Option } = Select;
const { Title } = Typography;

const CryptoCompare: React.FC = () => {
    const [timePeriod, setTimePeriod] = useState<Time>(Time.Week);
    const [coin1Id, setCoin1Id] = useState<string | null>(null);
    const [coin2Id, setCoin2Id] = useState<string | null>(null);
    const [isPercentageMode, setIsPercentageMode] = useState<boolean>(false);

    const { data: cryptoList, isFetching: isListFetching } = useGetCryptosQuery(100);

    // Default selection
    useEffect(() => {
        if (cryptoList?.data?.coins && cryptoList.data.coins.length > 1 && !coin1Id) {
            setCoin1Id(cryptoList.data.coins[0].uuid); // BTC
            setCoin2Id(cryptoList.data.coins[1].uuid); // ETH
        }
    }, [cryptoList, coin1Id]);

    const { data: coin1Details, isFetching: isCoin1Fetching } = useGetCryptoDetailsQuery(coin1Id || undefined, { skip: !coin1Id });
    const { data: coin2Details, isFetching: isCoin2Fetching } = useGetCryptoDetailsQuery(coin2Id || undefined, { skip: !coin2Id });

    const { data: coin1History, isFetching: isHistory1Fetching } = useGetCryptoHistoryQuery(
        { coinId: coin1Id || undefined, timePeriod },
        { skip: !coin1Id }
    );
    const { data: coin2History, isFetching: isHistory2Fetching } = useGetCryptoHistoryQuery(
        { coinId: coin2Id || undefined, timePeriod },
        { skip: !coin2Id }
    );

    if (isListFetching) return <Loader />;

    const coin1 = coin1Details?.data?.coin;
    const coin2 = coin2Details?.data?.coin;

    // Chart Data Preparation
    let coinTimestamp: string[] = [];
    let coin1DataPoints: number[] = [];
    let coin2DataPoints: number[] = [];

    if (coin1History?.data?.history && coin2History?.data?.history) {
        // API returns Newest -> Oldest
        const history1 = coin1History.data.history;
        const history2 = coin2History.data.history;

        // Extract raw data
        for (let i = 0; i < history1.length; i += 1) {
            const timestamp = new Date(history1[i].timestamp * 1000).toLocaleDateString();
            coinTimestamp.push(timestamp);
            coin1DataPoints.push(parseFloat(history1[i].price));
        }
        for (let i = 0; i < history2.length; i += 1) {
            // Assuming aligned timestamps for simplicity
            coin2DataPoints.push(parseFloat(history2[i].price));
        }

        // Reverse to Oldest -> Newest
        coinTimestamp = coinTimestamp.reverse();
        coin1DataPoints = coin1DataPoints.reverse();
        coin2DataPoints = coin2DataPoints.reverse();
    }

    // Process for Percentage Mode
    let chartData1 = coin1DataPoints;
    let chartData2 = coin2DataPoints;

    if (isPercentageMode && coin1DataPoints.length > 0 && coin2DataPoints.length > 0) {
        const start1 = coin1DataPoints[0];
        const start2 = coin2DataPoints[0];
        chartData1 = coin1DataPoints.map(p => ((p - start1) / start1) * 100);
        chartData2 = coin2DataPoints.map(p => ((p - start2) / start2) * 100);
    }

    const chartData = {
        labels: coinTimestamp,
        datasets: [
            {
                label: coin1?.name || 'Coin 1',
                data: chartData1,
                borderColor: coin1?.color || '#0071bd',
                backgroundColor: coin1?.color || '#0071bd',
                yAxisID: 'y',
            },
            {
                label: coin2?.name || 'Coin 2',
                data: chartData2,
                borderColor: coin2?.color || '#555',
                backgroundColor: coin2?.color || '#555',
                // In Percentage Mode, we share the 'y' axis (both are %)
                // In Price Mode, we use 'y1' for the second coin
                yAxisID: isPercentageMode ? 'y' : 'y1',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: isPercentageMode ? 'ROI Comparison (%)' : 'Price Comparison ($)' },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            if (isPercentageMode) {
                                label += context.parsed.y.toFixed(2) + '%';
                            } else {
                                label += '$ ' + context.parsed.y.toFixed(2);
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: isPercentageMode ? 'Return (%)' : `${coin1?.symbol} Price ($)` },
                ticks: {
                    callback: function (value: any) {
                        return isPercentageMode ? value + '%' : '$' + value;
                    }
                }
            },
            y1: {
                type: 'linear' as const,
                display: !isPercentageMode, // Hide if percentage mode
                position: 'right' as const,
                grid: { drawOnChartArea: false },
                title: { display: true, text: `${coin2?.symbol} Price ($)` },
                ticks: {
                    callback: function (value: any) {
                        return '$' + value;
                    }
                }
            },
        },
    };

    // Metrics Table Data
    const metricsData = [
        { key: '1', metric: 'Price', val1: coin1 ? `$ ${millify(Number(coin1.price))}` : '-', val2: coin2 ? `$ ${millify(Number(coin2.price))}` : '-' },
        { key: '2', metric: 'Market Cap', val1: coin1 ? `$ ${millify(Number(coin1.marketCap))}` : '-', val2: coin2 ? `$ ${millify(Number(coin2.marketCap))}` : '-' },
        { key: '3', metric: '24h Volume', val1: coin1 ? `$ ${millify(Number(coin1['24hVolume']))}` : '-', val2: coin2 ? `$ ${millify(Number(coin2['24hVolume']))}` : '-' },
        { key: '4', metric: 'All Time High', val1: coin1 ? `$ ${millify(Number(coin1.allTimeHigh.price))}` : '-', val2: coin2 ? `$ ${millify(Number(coin2.allTimeHigh.price))}` : '-' },
        { key: '5', metric: 'Number of Markets', val1: coin1 ? coin1.numberOfMarkets : '-', val2: coin2 ? coin2.numberOfMarkets : '-' },
        { key: '6', metric: 'Number of Exchanges', val1: coin1 ? coin1.numberOfExchanges : '-', val2: coin2 ? coin2.numberOfExchanges : '-' },
    ];

    const columns = [
        { title: 'Metric', dataIndex: 'metric', key: 'metric' },
        { title: coin1?.name || 'Coin 1', dataIndex: 'val1', key: 'val1' },
        { title: coin2?.name || 'Coin 2', dataIndex: 'val2', key: 'val2' },
    ];

    return (
        <div style={{ marginTop: '20px' }}>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Title level={2} className="heading">Crypto Comparison Tool</Title>
                </Col>

                {/* Controls */}
                <Col xs={24} md={6}>
                    <Select
                        showSearch
                        value={coin1Id}
                        onChange={(v) => setCoin1Id(v)}
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="Select Coin 1"
                        optionFilterProp="children"
                    >
                        {cryptoList?.data?.coins?.map((c) => <Option key={c.uuid} value={c.uuid}>{c.name}</Option>)}
                    </Select>
                </Col>
                <Col xs={24} md={6}>
                    <Select
                        showSearch
                        value={coin2Id}
                        onChange={(v) => setCoin2Id(v)}
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="Select Coin 2"
                        optionFilterProp="children"
                    >
                        {cryptoList?.data?.coins?.map((c) => <Option key={c.uuid} value={c.uuid}>{c.name}</Option>)}
                    </Select>
                </Col>
                <Col xs={24} md={6}>
                    <Select
                        value={timePeriod}
                        onChange={(v) => setTimePeriod(v)}
                        style={{ width: '100%' }}
                        size="large"
                    >
                        {Object.values(Time).map((t) => <Option key={t} value={t}>{t}</Option>)}
                    </Select>
                </Col>
                <Col xs={24} md={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>ROI % Mode:</span>
                    <Switch
                        checked={isPercentageMode}
                        onChange={(checked) => setIsPercentageMode(checked)}
                    />
                </Col>
            </Row>

            {(isCoin1Fetching || isCoin2Fetching || isHistory1Fetching || isHistory2Fetching) ? (
                <Loader />
            ) : (
                <>
                    <Row style={{ marginTop: 20 }}>
                        <Col span={24}>
                            <Card>
                                <Line data={chartData} options={chartOptions} />
                            </Card>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 20 }}>
                        <Col span={24}>
                            <Table
                                columns={columns}
                                dataSource={metricsData}
                                pagination={false}
                                bordered
                                title={() => 'Side-by-Side Comparison'}
                            />
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                        <Col xs={24} md={12}>
                            <Card title={`About ${coin1?.name}`}>
                                {HTMLReactParser(coin1?.description || '')}
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title={`About ${coin2?.name}`}>
                                {HTMLReactParser(coin2?.description || '')}
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default CryptoCompare;
