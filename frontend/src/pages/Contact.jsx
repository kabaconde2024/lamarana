import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/auth/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (data.ok) {
      alert('Message envoyé avec succès !');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      alert('Erreur: ' + data.message);
    }
  } catch (error) {
    alert("Impossible de contacter le serveur.");
  }
};

  return (
    <div className="mt-4">
      <h1 className="mb-4">
        <i className="fas fa-envelope text-primary me-2"></i>
        Contactez-nous
      </h1>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label">
                        Nom complet <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">
                      Sujet <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="question">Question générale</option>
                      <option value="technique">Problème technique</option>
                      <option value="stage">Question sur les stages</option>
                      <option value="compte">Problème de compte</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail..."
                      required
                    ></textarea>
                  </div>

                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-paper-plane me-2"></i>
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5>
                <i className="fas fa-map-marker-alt text-danger me-2"></i>
                Adresse
              </h5>
              <p className="text-muted mb-0">
                Institut Supérieur des Études Technologiques<br />
                Tunisie
              </p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5>
                <i className="fas fa-phone text-success me-2"></i>
                Téléphone
              </h5>
              <p className="text-muted mb-0">
                +216 XX XXX XXX
              </p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5>
                <i className="fas fa-envelope text-primary me-2"></i>
                Email
              </h5>
              <p className="text-muted mb-0">
                contact@stages-isett.tn
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5>
                <i className="fas fa-clock text-warning me-2"></i>
                Horaires
              </h5>
              <p className="text-muted mb-0">
                Lundi - Vendredi<br />
                08:00 - 17:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
