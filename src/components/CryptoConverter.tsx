import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Typography, Spin } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useGetCryptosQuery, useGetReferenceCurrenciesQuery, useGetCryptoPriceQuery } from '../services/cryptoApi';
import { Loader } from '.';

const { Option, OptGroup } = Select;
const { Title } = Typography;

const CryptoConverter: React.FC = () => {
    const { data: cryptoList, isFetching: isCryptosFetching } = useGetCryptosQuery(100);
    const { data: referenceCurrencies, isFetching: isRefsFetching } = useGetReferenceCurrenciesQuery();

    const [amount, setAmount] = useState<number>(1);
    const [fromCurrency, setFromCurrency] = useState<string | null>(null);
    const [toCurrency, setToCurrency] = useState<string | null>(null);
    const [result, setResult] = useState<number | string>(0);
    const [exchangeRate, setExchangeRate] = useState<number>(0);

    // Helpers to identify currency type
    const isFiat = (uuid: string) => referenceCurrencies?.data?.currencies?.some((c: any) => c.uuid === uuid);
    const isCoin = (uuid: string) => cryptoList?.data?.coins?.some((c: any) => c.uuid === uuid);

    // Dynamic Query Parameters for Crypto <-> Fiat
    const [priceQueryArgs, setPriceQueryArgs] = useState<{ coinId: string, referenceCurrencyUuid: string } | null>(null);

    // Fetch Price Data when needed 
    const { data: priceData, isFetching: isPriceFetching } = useGetCryptoPriceQuery(
        priceQueryArgs || { coinId: '', referenceCurrencyUuid: '' },
        { skip: !priceQueryArgs }
    );

    // Set default currencies
    useEffect(() => {
        if (cryptoList?.data?.coins?.length > 1 && !fromCurrency) {
            setFromCurrency(cryptoList.data.coins[0].uuid);
            setToCurrency(cryptoList.data.coins[1].uuid);
        }
    }, [cryptoList, fromCurrency, toCurrency]);

    // Conversion Logic Handler
    useEffect(() => {
        if (!fromCurrency || !toCurrency || !cryptoList) return;

        // Reset previous query
        setPriceQueryArgs(null);

        // Case 1: Crypto -> Crypto (Client Side)
        if (isCoin(fromCurrency) && isCoin(toCurrency)) {
            const fromCoin = cryptoList.data.coins.find((c: any) => c.uuid === fromCurrency);
            const toCoin = cryptoList.data.coins.find((c: any) => c.uuid === toCurrency);

            if (fromCoin && toCoin) {
                const rate = parseFloat(fromCoin.price) / parseFloat(toCoin.price);
                setExchangeRate(rate);
                setResult((amount * rate).toFixed(6));
            }
        }
        // Case 2: Crypto -> Fiat
        else if (isCoin(fromCurrency) && isFiat(toCurrency)) {
            setPriceQueryArgs({ coinId: fromCurrency, referenceCurrencyUuid: toCurrency });
        }
        // Case 3: Fiat -> Crypto
        else if (isFiat(fromCurrency) && isCoin(toCurrency)) {
            setPriceQueryArgs({ coinId: toCurrency, referenceCurrencyUuid: fromCurrency });
        }
    }, [fromCurrency, toCurrency, amount, cryptoList, referenceCurrencies]);

    // Handle API Response for Crypto <-> Fiat cases
    useEffect(() => {
        if (priceData?.data?.coin && priceQueryArgs) {
            const price = parseFloat(priceData.data.coin.price);

            if (isCoin(fromCurrency!) && isFiat(toCurrency!)) {
                // Crypto -> Fiat: Price is straight forward (e.g. 1 BTC = $50000)
                setExchangeRate(price);
                setResult((amount * price).toFixed(6));
            } else if (isFiat(fromCurrency!) && isCoin(toCurrency!)) {
                // Fiat -> Crypto: Price is denominated in Fiat (e.g. 1 BTC = $50000)
                // We want to know how much 1 Fiat is in BTC: 1/50000
                const rate = 1 / price;
                setExchangeRate(rate);
                setResult((amount * rate).toFixed(6));
            }
        }
    }, [priceData, amount, fromCurrency, toCurrency, priceQueryArgs]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    if (isCryptosFetching || isRefsFetching) return <Loader />;

    // Helper to get symbol and icon safely
    const getCurrencyDetails = (uuid: string | null) => {
        if (!uuid) return { symbol: '', icon: '$', color: undefined };

        const coin = cryptoList?.data?.coins.find((c: any) => c.uuid === uuid);
        if (coin) return { symbol: coin.symbol, icon: coin.sign || '$', color: coin.color };

        const fiat = referenceCurrencies?.data?.currencies.find((c: any) => c.uuid === uuid);
        if (fiat) return { symbol: fiat.symbol, icon: fiat.sign || '$', color: undefined };

        return { symbol: '', icon: '$', color: undefined };
    };

    const fromDetails = getCurrencyDetails(fromCurrency);
    const toDetails = getCurrencyDetails(toCurrency);

    return (
        <Row justify="center" align="middle" style={{ marginTop: '20px' }}>
            <Col xs={24} sm={20} md={16} lg={12}>
                <Card title={<Title level={3}>Cryptocurrency Converter</Title>} bordered={false} className="converter-card">
                    <Row gutter={[16, 16]} align="middle">
                        {/* From Currency */}
                        <Col span={24}>
                            <div className="converter-input-group">
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                    size="large"
                                    prefix={<span style={{ fontWeight: 'bold', color: fromDetails.color }}>{fromDetails.icon}</span>}
                                />
                                <Select
                                    showSearch
                                    value={fromCurrency}
                                    onChange={(value) => setFromCurrency(value)}
                                    style={{ width: '150px', marginLeft: '10px' }}
                                    size="large"
                                    optionFilterProp="children"
                                >
                                    <OptGroup label="Cryptocurrencies">
                                        {cryptoList?.data?.coins.map((currency: any) => (
                                            <Option key={currency.uuid} value={currency.uuid}>{currency.symbol}</Option>
                                        ))}
                                    </OptGroup>
                                    <OptGroup label="Fiat Currencies">
                                        {referenceCurrencies?.data?.currencies.map((currency: any) => (
                                            <Option key={currency.uuid} value={currency.uuid}>{currency.symbol}</Option>
                                        ))}
                                    </OptGroup>
                                </Select>
                            </div>
                        </Col>

                        <Col span={24} style={{ textAlign: 'center' }}>
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<SwapOutlined rotate={90} />}
                                onClick={handleSwap}
                                size="large"
                            />
                        </Col>

                        {/* To Currency */}
                        <Col span={24}>
                            <div className="converter-input-group">
                                <Input
                                    value={isPriceFetching ? 'Loading...' : result}
                                    readOnly
                                    size="large"
                                    prefix={<span style={{ fontWeight: 'bold', color: toDetails.color }}>≈ {toDetails.icon}</span>}
                                />
                                <Select
                                    showSearch
                                    value={toCurrency}
                                    onChange={(value) => setToCurrency(value)}
                                    style={{ width: '150px', marginLeft: '10px' }}
                                    size="large"
                                    optionFilterProp="children"
                                >
                                    <OptGroup label="Cryptocurrencies">
                                        {cryptoList?.data?.coins.map((currency: any) => (
                                            <Option key={currency.uuid} value={currency.uuid}>{currency.symbol}</Option>
                                        ))}
                                    </OptGroup>
                                    <OptGroup label="Fiat Currencies">
                                        {referenceCurrencies?.data?.currencies.map((currency: any) => (
                                            <Option key={currency.uuid} value={currency.uuid}>{currency.symbol}</Option>
                                        ))}
                                    </OptGroup>
                                </Select>
                            </div>
                        </Col>

                        <Col span={24} style={{ textAlign: 'center', marginTop: '10px' }}>
                            <Typography.Text type="secondary">
                                {isPriceFetching ? <Spin size="small" /> : `1 ${fromDetails.symbol} = ${exchangeRate.toFixed(6)} ${toDetails.symbol}`}
                            </Typography.Text>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};

export default CryptoConverter;
