import { useTheme } from '@/contexts/ThemeContext';
import {
    Factory,
    FileText,
    Users,
    BarChart3,
    CheckCircle,
    Zap,
    Clock,
    Settings,
    TrendingUp,
    Gauge,
    Play,
    Video,
    Sun,
    Moon
} from 'lucide-react';

export function FactoryPulseLanding() {
    const { isDark, toggleMode } = useTheme();

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-blue-50/30">
            {/* Navigation Header */}
            <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                                <span className="text-primary-content font-bold">FP</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-base-content">Factory Pulse</span>
                                <span className="ml-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                    Manufacturing OS
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={toggleMode}
                                    className="p-2 rounded-full hover:bg-base-200 transition-colors"
                                >
                                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="hidden md:flex items-center space-x-4">
                                <a href="#features" className="text-sm font-medium text-base-content/70 hover:text-base-content transition-colors">
                                    Features
                                </a>
                                <a href="#benefits" className="text-sm font-medium text-base-content/70 hover:text-base-content transition-colors">
                                    Benefits
                                </a>
                                <a href="#analytics" className="text-sm font-medium text-base-content/70 hover:text-base-content transition-colors">
                                    Analytics
                                </a>
                            </div>
                            <a href="#demo" className="btn btn-primary text-white text-sm px-4 py-2">
                                <Play className="w-4 h-4 mr-2" />
                                View Demo
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold text-base-content mb-6">
                            The Heartbeat of
                            <span className="text-primary block">Modern Manufacturing</span>
                        </h1>
                        <p className="text-xl text-base-content/80 mb-8 leading-relaxed">
                            Comprehensive manufacturing operating system with intelligent RFQ management,
                            cross-functional workflows, and data-driven insights. From inquiry to delivery,
                            Factory Pulse connects your entire operation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#rfq" className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all">
                                <FileText className="w-5 h-5 mr-2" />
                                Start New Project
                                <TrendingUp className="w-5 h-5 ml-2" />
                            </a>
                            <a href="#demo" className="btn btn-outline text-lg px-8 py-4 border-2 border-base-300 hover:border-primary hover:text-primary transition-all">
                                <Video className="w-5 h-5 mr-2" />
                                Watch Demo
                            </a>
                        </div>

                        {/* Stats Badges */}
                        <div className="flex flex-wrap justify-center gap-4 mt-12">
                            <div className="flex items-center space-x-2 bg-base-200 px-4 py-2 rounded-full">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">50% faster processing</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-base-200 px-4 py-2 rounded-full">
                                <CheckCircle className="w-4 h-4 text-success" />
                                <span className="text-sm font-medium">90% supplier response rate</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-base-200 px-4 py-2 rounded-full">
                                <BarChart3 className="w-4 h-4 text-info" />
                                <span className="text-sm font-medium">30% faster quote turnaround</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                            Complete Manufacturing OS
                        </h2>
                        <p className="text-lg text-base-content/80 max-w-3xl mx-auto">
                            Everything you need to manage your manufacturing operations, from project intake
                            through technical review, supplier coordination, and production planning.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card card-elevated bg-base-100 border border-base-200">
                            <div className="card-body">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                                    <FileText className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="card-title text-xl mb-3">Smart RFQ Management</h3>
                                <p className="text-base-content/70 leading-relaxed">
                                    Streamline your request-for-quote process with automated workflows and
                                    intelligent routing across engineering, QA, and production teams.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="card card-elevated bg-base-100 border border-base-200">
                            <div className="card-body">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                                    <Users className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="card-title text-xl mb-3">Cross-Functional Collaboration</h3>
                                <p className="text-base-content/70 leading-relaxed">
                                    Enable seamless collaboration between engineering, procurement, and production
                                    teams with structured review workflows and real-time feedback.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="card card-elevated bg-base-100 border border-base-200">
                            <div className="card-body">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                                    <BarChart3 className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="card-title text-xl mb-3">Real-time Performance Analytics</h3>
                                <p className="text-base-content/70 leading-relaxed">
                                    Track processing times, bottlenecks, and conversion rates with comprehensive
                                    dashboards that highlight opportunities for improvement.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="card card-elevated bg-base-100 border border-base-200">
                            <div className="card-body">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                                    <CheckCircle className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="card-title text-xl mb-3">Quality-Driven Review Process</h3>
                                <p className="text-base-content/70 leading-relaxed">
                                    Built-in review processes ensure every quote meets your quality standards
                                    with engineering feasibility assessments and risk identification.
                                </p>
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="card card-elevated bg-base-100 border border-base-200">
                            <div className="card-body">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                                    <Zap className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="card-title text-xl mb-3">Automated Workflows</h3>
                                <p className="text-base-content/70 leading-relaxed">
                                    Reduce processing time with intelligent automation, priority scoring,
                                    and approval chains that adapt to your business rules.
                                </p>
                            </div>
                        </div>

                        {/* Feature 6 */}
                        <div className="card card-elevated bg-base-100 border border-base-200">
                            <div className="card-body">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                                    <Factory className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="card-title text-xl mb-3">End-to-End Manufacturing Visibility</h3>
                                <p className="text-base-content/70 leading-relaxed">
                                    From initial inquiry through production planning and delivery, maintain
                                    complete traceability of every project and component.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kanban Dashboard Preview */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                            Workflow Management
                        </h2>
                        <p className="text-lg text-base-content/80 max-w-2xl mx-auto">
                            Visualize your entire manufacturing process with our intuitive Kanban dashboard
                        </p>
                    </div>

                    <div className="bg-base-100 rounded-2xl p-6 shadow-xl border border-base-200 overflow-x-auto">
                        <div className="flex space-x-4 min-w-max pb-4">
                            {/* Inquiry Received */}
                            <div className="flex-shrink-0 w-80">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-base-content">
                                        Inquiry Received <span className="badge badge-ghost">2</span>
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-base-200 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="rfq-id font-bold text-primary">P-25082203</span>
                                            <span className="priority-badge low text-xs px-2 py-1 rounded-full">Low</span>
                                        </div>
                                        <h4 className="font-medium text-base-content mb-1">New Enclosure Design</h4>
                                        <div className="text-sm text-base-content/60 flex items-center">
                                            <Users className="w-3 h-3 mr-1" />
                                            Anna Tran ·
                                            <FileText className="w-3 h-3 ml-2 mr-1" />
                                            4 files
                                        </div>
                                    </div>
                                    <div className="bg-base-200 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="rfq-id font-bold text-error">P-25082101</span>
                                            <span className="priority-badge high text-xs px-2 py-1 rounded-full">High</span>
                                        </div>
                                        <h4 className="font-medium text-base-content mb-1">Motor Bracket</h4>
                                        <div className="text-sm text-base-content/60 flex items-center">
                                            <Users className="w-3 h-3 mr-1" />
                                            David Kim ·
                                            <TrendingUp className="w-3 h-3 ml-2 mr-1 text-warning" />
                                            2 risks
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Review */}
                            <div className="flex-shrink-0 w-80">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-base-content">
                                        Technical Review <span className="badge badge-ghost">1</span>
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-base-200 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="rfq-id font-bold text-error">P-25082101</span>
                                            <span className="priority-badge high text-xs px-2 py-1 rounded-full">High</span>
                                        </div>
                                        <h4 className="font-medium text-base-content mb-1">Motor Bracket</h4>
                                        <div className="text-sm text-base-content/60 flex items-center">
                                            <Users className="w-3 h-3 mr-1" />
                                            Engineering Review
                                        </div>
                                        <div className="mt-2 flex space-x-2">
                                            <span className="badge badge-outline">Eng: 🟡</span>
                                            <span className="badge badge-outline">QA: ✅</span>
                                            <span className="badge badge-outline">Prod: ❌</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Supplier RFQ Sent */}
                            <div className="flex-shrink-0 w-80">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-base-content">
                                        Supplier RFQ Sent <span className="badge badge-ghost">1</span>
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-base-200 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="rfq-id font-bold text-warning">P-25082001</span>
                                            <span className="priority-badge medium text-xs px-2 py-1 rounded-full">Medium</span>
                                        </div>
                                        <h4 className="font-medium text-base-content mb-1">Sensor Mount</h4>
                                        <div className="text-sm text-base-content/60 flex items-center">
                                            <Users className="w-3 h-3 mr-1" />
                                            Sarah Lee
                                        </div>
                                        <div className="mt-2 text-xs">
                                            <div className="flex justify-between">
                                                <span>3 suppliers contacted</span>
                                                <span className="text-success">2/3 quotes in</span>
                                            </div>
                                            <div className="w-full bg-base-300 rounded-full h-1.5 mt-1">
                                                <div className="bg-primary h-1.5 rounded-full" style={{ width: '67%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quoted */}
                            <div className="flex-shrink-0 w-80">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-base-content">
                                        Quoted <span className="badge badge-ghost">0</span>
                                    </h3>
                                </div>
                                <div className="text-center py-16 text-base-content/50">
                                    <FileText className="w-16 h-16 mx-auto mb-2" />
                                    <p>No projects quoted</p>
                                </div>
                            </div>

                            {/* Order Confirmed */}
                            <div className="flex-shrink-0 w-80">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-base-content">
                                        Order Confirmed <span className="badge badge-ghost">0</span>
                                    </h3>
                                </div>
                                <div className="text-center py-16 text-base-content/50">
                                    <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                                    <p>No orders confirmed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-base-200 bg-base-100/70">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-primary-content font-bold">FP</span>
                                </div>
                                <div>
                                    <span className="text-xl font-bold text-base-content">Factory Pulse</span>
                                    <div className="text-sm text-base-content/60">Manufacturing Operating System</div>
                                </div>
                            </div>
                            <p className="text-base-content/70 mb-4">
                                The heartbeat of modern manufacturing. Connecting sales, engineering,
                                procurement, and production teams from inquiry to delivery.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-base-content mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-base-content/70 hover:text-primary transition-colors">Features</a></li>
                                <li><a href="#demo" className="text-base-content/70 hover:text-primary transition-colors">Demo</a></li>
                                <li><a href="#" className="text-base-content/70 hover:text-primary transition-colors">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-base-content mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-base-content/70 hover:text-primary transition-colors">About</a></li>
                                <li><a href="#" className="text-base-content/70 hover:text-primary transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-base-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="text-base-content/60 text-sm">© 2025 Factory Pulse. All rights reserved.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}