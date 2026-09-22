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
import AcademyHome from './pages/AcademyHome';
import AcademyCourseRoom from './pages/AcademyCourseRoom';
import AcademyLessonPreview from './pages/AcademyLessonPreview';
import AcademyExplore from './pages/AcademyExplore';
import AcademyCreatorCampus from './pages/AcademyCreatorCampus';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import VStreamAIAssistant from '@/components/ai/VStreamAIAssistant';
import { BlueProvider } from '@/lib/BlueContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? "Dashboard";
const MainPage = Dashboard;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AcademyTestShell = () => (
  <div style={{minHeight:'100vh',background:'#03080f',color:'#e8f4ff',padding:'32px',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:960,margin:'0 auto'}}>
      <div style={{display:'inline-block',padding:'6px 10px',border:'1px solid #1e78ff',borderRadius:999,color:'#7ddcff',fontSize:12,fontWeight:800}}>BLUE ACADEMY • TEST SHELL</div>
      <h1 style={{fontSize:'clamp(36px,7vw,68px)',lineHeight:1.02,margin:'24px 0 12px'}}>The test site is rendering.</h1>
      <p style={{maxWidth:720,color:'#9fc3e8',fontSize:18,lineHeight:1.7}}>This route intentionally bypasses the VStream layout, authentication UI, Blue UI, and data-loading surfaces. We use it to prove the deployed React application can render before reconnecting systems one layer at a time.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginTop:32}}>
        {['Academy UI','VStream Shell','Blue','Auth & Data'].map((label,index)=><div key={label} style={{padding:20,border:'1px solid #12305f',borderRadius:18,background:'#06101f'}}><div style={{color:index===0?'#67e8f9':'#94a3b8',fontWeight:900}}>{label}</div><div style={{marginTop:8,color:'#6a9ec5',fontSize:14}}>{index===0?'Preview foundation ready':'Reconnect after render verification'}</div></div>)}
      </div>
      <a href='/Academy' style={{display:'inline-block',marginTop:28,padding:'12px 16px',borderRadius:12,background:'#1e78ff',color:'white',fontWeight:900,textDecoration:'none'}}>Open current Academy</a>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<AcademyTestShell />} />
      <Route path="/Academy" element={<LayoutWrapper currentPageName="Academy"><AcademyHome /></LayoutWrapper>} />
      <Route path="/Academy/Explore" element={<LayoutWrapper currentPageName="Academy"><AcademyExplore /></LayoutWrapper>} />
      <Route path="/Academy/CreatorCampus" element={<LayoutWrapper currentPageName="Academy"><AcademyCreatorCampus /></LayoutWrapper>} />
      <Route path="/Academy/Courses/3d-modeling-fundamentals" element={<LayoutWrapper currentPageName="Academy"><AcademyCourseRoom /></LayoutWrapper>} />
      <Route path="/Academy/Courses/3d-modeling-fundamentals/module-1" element={<LayoutWrapper currentPageName="Academy"><AcademyLessonPreview /></LayoutWrapper>} />

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
          <BlueProvider>
            <NavigationTracker />
            <AppRoutes />
            <VStreamAIAssistant surface="floating" />
          </BlueProvider>
        </AuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
