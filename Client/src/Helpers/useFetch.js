import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const useFetch = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCall();
        setData(response.data.data || response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        toast.error(err.response?.data?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      const response = await apiCall();
      setData(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      toast.error(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
