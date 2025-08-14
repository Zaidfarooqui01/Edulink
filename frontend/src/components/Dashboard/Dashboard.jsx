// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, Tab, Box, AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { logout } from '../../redux/slices/authSlice';
import CampusDrives from './tabs/CampusDrives';
import Competitions from './tabs/Competitions';
import Hackathons from './tabs/Hackathons';
import PlacementPrep from './tabs/PlacementPrep';
import Webinars from './tabs/Webinars';
import SportsEvents from './tabs/SportsEvents';
import Projects from './tabs/Projects';
import Chat from './chat/Chat';
import NotificationCenter from './NotificationCenter';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
  };

  const tabComponents = [
    <CampusDrives />,
    <Competitions />,
    <Hackathons />,
    <PlacementPrep />,
    <Webinars />,
    <SportsEvents />,
    <Projects />
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EduLink - Welcome, {user?.profile?.firstName}
          </Typography>
          
          <NotificationCenter />
          
          <Button
            onClick={handleProfileMenuOpen}
            sx={{ ml: 2 }}
          >
            <Avatar 
              src={user?.profile?.avatar} 
              alt={user?.profile?.firstName}
              sx={{ width: 32, height: 32 }}
            >
              {user?.profile?.firstName?.charAt(0)}
            </Avatar>
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: '100%', typography: 'body1' }}>
        <StyledTabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Campus Drives" />
          <Tab label="Competitions" />
          <Tab label="Hackathons" />
          <Tab label="Placement Prep" />
          <Tab label="Webinars" />
          <Tab label="Sports Events" />
          <Tab label="Projects" />
        </StyledTabs>
        
        <Box sx={{ p: 3 }}>
          {tabComponents[currentTab]}
        </Box>
      </Box>
      
      <Chat />
    </Box>
  );
};

export default Dashboard;
