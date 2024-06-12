document.addEventListener('DOMContentLoaded', function () {
    const gatepassForm = document.getElementById('gatepass-form');
    const gatepassesList = document.getElementById('gatepasses-list');
  
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to login first');
      window.location.href = 'login.html';
      return;
    }

    function formatDateToDDMMYYYY(isoString) {
      const date = new Date(isoString);
    
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
    
      return `${day}/${month}/${year}`;
    }
  
    gatepassForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const type = document.getElementById('type').value;
      const visitorName = document.getElementById('visitorName').value;
      const dateOfVisit = document.getElementById('dateOfVisit').value;
      const purpose = document.getElementById('purpose').value;
      const designation = document.getElementById('designation').value;
      const department = document.getElementById('department').value;
      const materials = document.getElementById('materials').value;
  
      const gatepassData = {
        type,
        visitorName,
        dateOfVisit,
        purpose,
        designation,
        department,
        materials
      };
  
      try {
        const response = await fetch('http://localhost:5000/api/gatepasses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(gatepassData)
        });
        console.log(response);
        if (response.ok) {
          alert('Gatepass request submitted successfully');
          loadGatepasses();
          gatepassForm.reset();
        } else {
          alert('Failed to submit gatepass request');
        }
      } catch (error) {
        console.error('Error submitting gatepass request:', error);
      }
    });
  
    // Function to load gatepasses
    async function loadGatepasses() {
      try {
        const response = await fetch('http://localhost:5000/api/allgatepasses', {
          method: 'GET',
          headers: {
            'Authorization': token
          }
        });
  
        if (response.ok) {
          const gatepasses = await response.json();
          renderGatepasses(gatepasses);
        } else {
          alert('Failed to load gatepasses');
        }
      } catch (error) {
        console.error('Error loading gatepasses:', error);
      }
    }
  
    // Function to render gatepasses
    function renderGatepasses(gatepasses) {
      gatepassesList.innerHTML = '';
      gatepasses.forEach(gatepass => {
        const gatepassItem = document.createElement('div');
        gatepassItem.classList.add('gatepass-item');
        gatepassItem.innerHTML = `
          <h3>${gatepass.type} Gatepass</h3>
          <p><strong>Visitor Name:</strong> ${gatepass.visitorName}</p>
          <p><strong>Date of Visit:</strong> ${formatDateToDDMMYYYY(gatepass.dateOfVisit)}</p>
          <p><strong>Purpose:</strong> ${gatepass.purpose}</p>
          <p><strong>Designation:</strong> ${gatepass.designation}</p>
          <p><strong>Department:</strong> ${gatepass.department}</p>
          ${gatepass.type === 'Material' ? `<p><strong>Materials:</strong> ${gatepass.materials}</p>` : ''}
          <p><strong>Status:</strong> ${gatepass.status}</p>
        `;
        gatepassesList.appendChild(gatepassItem);
      });
    }
  
    // Load gatepasses on page load
    loadGatepasses();
  });
  