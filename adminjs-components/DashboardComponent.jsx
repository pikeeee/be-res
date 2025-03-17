import React, { useState, useEffect } from 'react'
import { ApiClient } from 'adminjs'
import {
  Box, H2, Label, Select, Table, TableRow, TableCell, Button
} from '@adminjs/design-system'
import {
  ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line
} from 'recharts'

const api = new ApiClient()

const rangeOptions = [
  { value: 'week', label: '1 Week (by day)' },
  { value: 'month', label: '1 Month (by week)' },
  { value: 'year', label: '1 Year (by month)' },
]

const DashboardComponent = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [range, setRange] = useState('week')
  const [totalCount, setTotalCount] = useState(0)
  const [chartData, setChartData] = useState([])

  const selectedOption = rangeOptions.find(opt => opt.value === range)

  useEffect(() => {
    api.getDashboard({ params: { tab: activeTab, range } })
      .then((res) => {
        if (res.data) {
          setTotalCount(res.data.totalCount || 0)
          setChartData(res.data.chartData || [])
        }
      })
  }, [activeTab, range])

  const tabLabel = activeTab === 'users'
    ? 'Users'
    : activeTab === 'orders'
      ? 'Orders'
      : 'Products'
  const countLabel = activeTab === 'users'
    ? 'User Count'
    : activeTab === 'orders'
      ? 'Order Count'
      : 'Product Count'

  return (
    <Box variant="grey" padding="xl">
      <H2>Dashboard</H2>

      <Box marginBottom="lg" display="flex" gap="lg">
        <Button
          variant={activeTab === 'users' ? 'primary' : 'text'}
          onClick={() => setActiveTab('users')}
        >
          Users
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'primary' : 'text'}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </Button>
        <Button
          variant={activeTab === 'products' ? 'primary' : 'text'}
          onClick={() => setActiveTab('products')}
        >
          Products
        </Button>
      </Box>

      <Box marginBottom="lg" display="flex" alignItems="center" gap="lg">
        <Select
          id="rangeSelector"
          options={rangeOptions}
          value={selectedOption}
          onChange={(selected) => {
            if (selected) {
              setRange(selected.value)
            } else {
              setRange('week')
            }
          }}
        />
      </Box>

      <Box bg="white" padding="lg" borderRadius="lg" marginBottom="lg">
        <Label>{tabLabel}</Label>
        <Table>
          <TableRow style={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>
              <strong>{countLabel}</strong>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{totalCount}</TableCell>
          </TableRow>
        </Table>
      </Box>

      <Box bg="white" padding="lg" borderRadius="lg">
        <Label>{`Chart ${tabLabel}`}</Label>
        <Box height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke={
                  activeTab === 'users'
                    ? '#8884d8'
                    : activeTab === 'orders'
                      ? '#82ca9d'
                      : '#FF5733'
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardComponent
