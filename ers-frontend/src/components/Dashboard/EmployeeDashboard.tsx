import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ReimbursementInterface } from '../../interfaces/ReimbursementInterface';
import { ReimbursementForm } from '../Reimbursement/ReimbursementForm';
import { ReimbursementList } from '../Reimbursement/ReimbursementList';
import './EmployeeDashboard.css';
import { useGlobalData } from '../../globalData/store';
import { Link, useNavigate } from 'react-router-dom';

interface EmployeeDashboardProps {
    setUserRole: (role: string) => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ setUserRole }) => {
    const [reimbursements, setReimbursements] = useState<ReimbursementInterface[]>([]);
    const [filters, setFilters] = useState({
        PENDING: true,
        APPROVED: true,
        DENIED: true,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const { globalData, setGlobalData } = useGlobalData();
    const navigate = useNavigate();

    const fetchReimbursements = useCallback(async () => {
        setIsLoading(true);
        try {
            const userId = globalData.user?.userId;
            const user = sessionStorage.getItem('user');
            if (user) {
                const parsedUser = JSON.parse(user);
                const { userId, username, role } = parsedUser;
                setUserRole(parsedUser.role);
                setGlobalData(prev => ({ ...prev, user: { userId, username, role } })); // Update global context

                const response = await axios.get<ReimbursementInterface[]>(
                    `${globalData.baseUrl}/api/reimbursements/user/${userId}`
                );
                setReimbursements(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            setError('Failed to fetch reimbursement requests.');
        } finally {
            setIsLoading(false);
        }
    }, [globalData.user?.userId, globalData.baseUrl, setUserRole, setGlobalData]);

    useEffect(() => {
        fetchReimbursements();
    }, [fetchReimbursements]);

    const handleFilterToggle = (status: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [status]: !prev[status] }));
    };

    const filteredReimbursements = reimbursements.filter(
        reimbursement => filters[reimbursement.status as keyof typeof filters]
    );

    return (
        <div className="employee-dashboard">
            <h1>Employee Dashboard</h1>
            <ReimbursementForm onReimbursementSubmit={fetchReimbursements} />
            <div className="filter-tabs">
                <h2>Filter Reimbursements</h2>
                <div className="tabs">
                    {Object.keys(filters).map(status => (
                        <button
                            key={status}
                            className={`tab ${filters[status as keyof typeof filters] ? 'active' : ''}`}
                            onClick={() => handleFilterToggle(status as keyof typeof filters)}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>
            <h2>Your Reimbursement Requests</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <ReimbursementList reimbursements={filteredReimbursements} />
            )}
            <p className="register-link">
                <Link to="/logout">Logout</Link>
            </p>
        </div>
    );
};

export default EmployeeDashboard;
