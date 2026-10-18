import ReactDOM from 'react-dom/client';
import '../index.css';
import { FitMock } from './FitMock';
import { TransactionMock } from './TransactionMock';

const q = new URLSearchParams(window.location.search);
const step = Number(q.get('step') ?? 0);
ReactDOM.createRoot(document.getElementById('root')!).render(q.get('demo') === 'fit' ? <FitMock step={step} /> : <TransactionMock step={step} />);
document.body.dataset.ready = '1';
