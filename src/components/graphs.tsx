'use client'
import { useEffect, useState } from 'react'
import type { ApexOptions } from 'apexcharts'
import type { ChartDataPayload } from '@/types'
import IconLoader from './ui/icons/icon-loader'
import dynamic from 'next/dynamic'

const ReactApexChart = dynamic(
    () => import('react-apexcharts'),
    { ssr: false }
  )

export default function Dashboard() {
    const [kpi, setKpi] = useState<ChartDataPayload | null>(null)

    useEffect(() => {
        fetch('/api/kpi')
            .then((r) => r.json())
            .then(setKpi)
            .catch(console.error)
    }, [])

    if (!kpi) return <div className='flex'>Loading KPI charts <span className='ml-2'><IconLoader className='animate-spin' /></span></div>

    // ─────────────── Donut: Status Distribution ───────────────
    const statusDonutSeries = kpi.donut.series
    const statusDonutOptions: ApexOptions = {
        chart: {
            type: 'donut',
            height: 460,
            fontFamily: 'Nunito, sans-serif',
        },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: 25,
            colors: ['#fff'],
        },
        labels: kpi.donut.labels,
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: (w) =>
                                w.globals.seriesTotals.reduce((a, b) => a + b, 0),
                        },
                    },
                },
            },
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: { offsetX: -2 },
            height: 50,
            offsetY: 20,
        },
    }

    // ─────────────── Line: Monthly Changes ───────────────
    const monthlyLineSeries = [
        { name: 'Status Changes', data: kpi.line.series },
    ]
    const monthlyLineOptions: ApexOptions = {
        chart: {
            type: 'area',
            height: 325,
            fontFamily: 'Nunito, sans-serif',
            zoom: { enabled: false },
            toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            curve: 'smooth',
            width: 2,
            lineCap: 'square',
        },
        colors: ['#1B55E2'],
        xaxis: {
            categories: kpi.line.categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                offsetX: 0,
                offsetY: 5,
                style: { fontSize: '12px' },
                show:false
            },
        },
        yaxis: {
            tickAmount: 7,
            labels: {
                formatter: (v) => `${(v / 1000).toFixed(2)}K`,
                offsetX: -10,
                style: { fontSize: '12px' },
            },
        },
        grid: {
            borderColor: '#E0E6ED',
            strokeDashArray: 5,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            markers: { offsetX: -2 },
            itemMargin: { horizontal: 10, vertical: 5 },
        },
        tooltip: {
            x: { show: false },
            marker: { show: true },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.28,
                opacityTo: 0.05,
                stops: [45, 100],
            },
        },
    }

    return (
        kpi && (
            <div className="grid gap-6 mb-6 xl:grid-cols-3">
                <div className="h-full panel xl:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="text-lg font-semibold">Monthly Status Changes</h5>
                    </div>
                    <div className="relative bg-white rounded-lg">
                        <ReactApexChart
                            options={monthlyLineOptions}
                            series={monthlyLineSeries}
                            type="area"
                            height={325}
                            width="100%"
                        />
                    </div>
                </div>

                <div className="h-full panel">
                    <div className="flex items-center mb-5">
                        <h5 className="text-lg font-semibold">Status Distribution</h5>
                    </div>
                    <div className="bg-white rounded-lg">
                        <ReactApexChart
                            options={statusDonutOptions}
                            series={statusDonutSeries}
                            type="donut"
                            height={460}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        )
    )
}
