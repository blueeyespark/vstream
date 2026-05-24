import { Toaster } from "@/components/ui/toaster"
import UserViewer from './pages/UserViewer';
import ChannelPage from './pages/ChannelPage';
import VideoAnalyticsPage from './pages/VideoAnalyticsPage';
import ShortsPage from './pages/ShortsPage';
import LivePage from './pages/LivePage';
import StreamerDashboard from './pages/StreamerDashboard';
import FinancialOverview from './pages/FinancialOverview';
import AudienceAnalytics from './pages/AudienceAnalytics';
import DeepScanResults from './pages/DeepScanResults';
import Tasks from './pages/Tasks';
import AITools from './pages/AITools';
import WatchHistory from './pages/WatchHistory';
import SavedVideos from './pages/SavedVideos';
import Playlists from './pages/Playlists';
import CreatorStudio from './pages/CreatorStudio';
import ArtForgeStudio from './pages/ArtForgeStudio';
import Apply from './pages/Apply';
import TalentNexus from './pages/TalentNexus';
import WorldChat from './pages/WorldChat';
import TalentProfile from './pages/TalentProfile';
import ChronosArchive from './pages/ChronosArchive';
import MusicEditor from './pages/MusicEditor';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import VStreamAIAssistant from '@/components/ai/VStreamAIAssistant';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? "Dashboard";
const MainPage = Dashboard;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      <Route path="/Shorts" element={<LayoutWrapper currentPageName="Shorts"><ShortsPage /></LayoutWrapper>} />
      <Route path="/Live" element={<LayoutWrapper currentPageName="Live"><LivePage /></LayoutWrapper>} />
      <Route path="/Communities" element={<LayoutWrapper currentPageName="Communities"><WorldChat /></LayoutWrapper>} />
      <Route path="/WorldChat" element={<LayoutWrapper currentPageName="WorldChat"><WorldChat /></LayoutWrapper>} />
      <Route path="/TalentNexus" element={<LayoutWrapper currentPageName="TalentNexus"><TalentNexus /></LayoutWrapper>} />
      <Route path="/TalentProfile" element={<LayoutWrapper currentPageName="TalentProfile"><TalentProfile /></LayoutWrapper>} />
      <Route path="/Archive" element={<LayoutWrapper currentPageName="Archive"><ChronosArchive /></LayoutWrapper>} />
      <Route path="/Apply" element={<LayoutWrapper currentPageName="Apply"><Apply /></LayoutWrapper>} />
      <Route path="/Channel" element={<LayoutWrapper currentPageName="Channel"><ChannelPage /></LayoutWrapper>} />

      <Route element={<ProtectedRoute />}>
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="/Tasks" element={<LayoutWrapper currentPageName="Tasks"><Tasks /></LayoutWrapper>} />
        <Route path="/AITools" element={<LayoutWrapper currentPageName="AITools"><AITools /></LayoutWrapper>} />
        <Route path="/UserViewer" element={<LayoutWrapper currentPageName="UserViewer"><UserViewer /></LayoutWrapper>} />
        <Route path="/CreatorStudio" element={<LayoutWrapper currentPageName="CreatorStudio"><CreatorStudio /></LayoutWrapper>} />
        <Route path="/CreatorOS" element={<LayoutWrapper currentPageName="CreatorOS"><CreatorStudio /></LayoutWrapper>} />
        <Route path="/DeepScanResults" element={<LayoutWrapper currentPageName="DeepScanResults"><DeepScanResults /></LayoutWrapper>} />
        <Route path="/StreamerDashboard" element={<LayoutWrapper currentPageName="StreamerDashboard"><StreamerDashboard /></LayoutWrapper>} />
        <Route path="/FinancialOverview" element={<LayoutWrapper currentPageName="FinancialOverview"><FinancialOverview /></LayoutWrapper>} />
        <Route path="/AudienceAnalytics" element={<LayoutWrapper currentPageName="AudienceAnalytics"><AudienceAnalytics /></LayoutWrapper>} />
        <Route path="/VideoAnalytics" element={<LayoutWrapper currentPageName="VideoAnalytics"><VideoAnalyticsPage /></LayoutWrapper>} />
        <Route path="/WatchHistory" element={<LayoutWrapper currentPageName="WatchHistory"><WatchHistory /></LayoutWrapper>} />
        <Route path="/SavedVideos" element={<LayoutWrapper currentPageName="SavedVideos"><SavedVideos /></LayoutWrapper>} />
        <Route path="/Playlists" element={<LayoutWrapper currentPageName="Playlists"><Playlists /></LayoutWrapper>} />
        <Route path="/ArtForge" element={<LayoutWrapper currentPageName="ArtForge"><ArtForgeStudio /></LayoutWrapper>} />
        <Route path="/MusicEditor" element={<LayoutWrapper currentPageName="MusicEditor"><MusicEditor /></LayoutWrapper>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthProvider>
          <NavigationTracker />
          <AppRoutes />
          <VStreamAIAssistant surface="floating" />
        </AuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
