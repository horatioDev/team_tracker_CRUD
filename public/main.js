const updateBtns = document.querySelectorAll('#update-btn');
const deleteBtns = document.querySelectorAll('#delete-btn');
const cancelBtns = document.querySelectorAll('#cancel-btn');
const saveBtns = document.querySelectorAll('#save-btn');

updateBtns.forEach(updateBtn => {
  updateBtn.addEventListener('click', _ => {
    // get the id from url parameter
    const employeeId = updateBtn.dataset.id;
    console.log('clicked UPDATE btn', employeeId);
    window.location.href =`/employees/${employeeId}/edit`;
  });
})

function getEditFormData() {
  const form = document.getElementById('editEmployeeForm');
  const employeeFormData = {}
  const editForm = new FormData(form);
  console.log('ef',editForm)
  for(const [key, val] of editForm.entries()) {
    employeeFormData[key] = val;
  }
  console.log(employeeFormData)
  return employeeFormData;
}

// handle when a user clicks "Save Changes" on the Edit Quote page
saveBtns.forEach(saveBtn => {
  saveBtn.addEventListener("click", _=> {
    const employeeId = saveBtn.dataset.id;
    const employeeUpdatedData = getEditFormData();
    // send PUT request to server with updated information
    fetch(`/employees/${employeeId}`,{
      method: 'PUT',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeUpdatedData)
      }).then(_=> {
        alert('Your changes have been saved!')
      })
      .catch(err => console.error(err))
  })

});


cancelBtns.forEach(cancelBtn => {
  cancelBtn.addEventListener('click', _ => {

  });
});

deleteBtns.forEach(deleteBtn => {
  deleteBtn.addEventListener('click', _ => {
    const employeeId = deleteBtn.dataset.id;
    // const employeeDeleteData = getEditFormData();
    console.log(employeeId)
    fetch(`/employees/${employeeId}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify(employeeDeleteData)
    })
      .then(res => {
        if (res.ok) {
          console.log(res)
          return res.json()
        }
      })
      .then(data => {
        console.log('Deleted:', data)
        alert('Your changes have been saved!')
      })
      .catch(err => {
        console.error(err);
        alert('An error occurred while deleting the employee. Please try again later.'); 
      })
  });
});