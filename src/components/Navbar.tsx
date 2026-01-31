import {
  BulbOutlined,
  FundViewOutlined,
  HomeOutlined,
  MenuOutlined,
  MoneyCollectOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Menu, Typography } from 'antd';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import icon from '../images/cryptocurrency.png';

function Navbar(): JSX.Element {
  const [activeMenu, setActiveMenu] = React.useState<boolean>(true);
  const [screenSize, setScreenSize] = React.useState<number | null>(null);

  useEffect(() => {
    const handleResize = (): void => setScreenSize(window.innerWidth);

    window.addEventListener('resize', handleResize);

    handleResize();

    return (): void => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (screenSize && screenSize < 800) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  return (
    <div className="nav-container">
      <div className="logo-container">
        <Avatar src={icon} size="large" />
        <Typography.Title level={2} className="logo">
          <Link to="/">CryptoMarketCap</Link>
        </Typography.Title>
        <Button className="menu-control-container" onClick={() => setActiveMenu((prev) => !prev)}>
          <MenuOutlined />
        </Button>
      </div>
      {activeMenu && (
        <Menu theme="dark">
          <Menu.Item key={1} icon={<HomeOutlined />}>
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key={2} icon={<FundViewOutlined />}>
            <Link to="/cryptocurrencies">Cryptocurrencies</Link>
          </Menu.Item>
          <Menu.Item key={3} icon={<MoneyCollectOutlined />}>
            <Link to="/exchanges">Exchanges</Link>
          </Menu.Item>
          <Menu.Item key={4} icon={<BulbOutlined />}>
            <Link to="/news">News</Link>
          </Menu.Item>
          <Menu.Item key={5} icon={<CalculatorOutlined />}>
            <Link to="/converter">Converter</Link>
          </Menu.Item>
        </Menu>
      )}
    </div>
  );
}

export default Navbar;
