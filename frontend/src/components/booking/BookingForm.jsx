import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Booking = () => {
  const { t } = useTranslation();
  const [salons, setSalons] = useState([]);
  const [formData, setFormData] = useState({
    salon: '',
    service: 'manicure',
    date: '',
    phone: '',
    name: '',
    language: 'en'
  });

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await axios.get('/api/salons?location=johannesburg');
        setSalons(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSalons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/appointments', {
        salonId: formData.salon,
        service: formData.service,
        date: formData.date,
        clientPhone: formData.phone,
        clientName: formData.name,
        language: formData.language
      });
      alert(t('bookingSuccess'));
    } catch (err) {
      console.error(err);
      alert(t('bookingError'));
    }
  };

  return (
    <div className="booking-form">
      <h2>{t('bookAppointment')}</h2>
      <form onSubmit={handleSubmit}>
        <select 
          value={formData.salon} 
          onChange={e => setFormData({...formData, salon: e.target.value})}
          required
        >
          <option value="">{t('selectSalon')}</option>
          {salons.map(salon => (
            <option key={salon._id} value={salon._id}>
              {salon.name} - {salon.location}
            </option>
          ))}
        </select>
        
        <select
          value={formData.service}
          onChange={e => setFormData({...formData, service: e.target.value})}
        >
          <option value="manicure">{t('manicure')}</option>
          <option value="pedicure">{t('pedicure')}</option>
          <option value="acrylics">{t('acrylics')}</option>
        </select>
        
        <input
          type="datetime-local"
          value={formData.date}
          onChange={e => setFormData({...formData, date: e.target.value})}
          required
        />
        
        <input
          type="text"
          placeholder={t('namePlaceholder')}
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          required
        />
        
        <input
          type="tel"
          placeholder={t('phonePlaceholder')}
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
          required
        />
        
        <select
          value={formData.language}
          onChange={e => setFormData({...formData, language: e.target.value})}
        >
          <option value="en">English</option>
          <option value="zu">Zulu</option>
          <option value="af">Afrikaans</option>
        </select>
        
        <button type="submit">{t('bookNow')}</button>
      </form>
    </div>
  );
};

export default Booking;