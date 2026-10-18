import ReactDOM from 'react-dom/client';
import '../index.css';
import { FitMock } from './FitMock';
import { ImacMock } from './ImacMock';
import { TransactionMock } from './TransactionMock';

const q = new URLSearchParams(window.location.search);
const step = Number(q.get('step') ?? 0);
const demo = q.get('demo');
ReactDOM.createRoot(document.getElementById('root')!).render(demo === 'fit' ? <FitMock step={step} /> : demo === 'imac' ? <ImacMock step={step} /> : <TransactionMock step={step} />);
document.body.dataset.ready = '1';
