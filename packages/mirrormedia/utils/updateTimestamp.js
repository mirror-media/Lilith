async function updateTimestamp(mutation, time) {
  try {
    const response = await fetch(`/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variable: { time },
      }),
    })

    if (response.ok) {
      alert('已更新時間為現在，重新整理後即可看到！')
    } else {
      console.error('Mutation request failed:', response.status)
    }
  } catch (error) {
    console.error('Error updating timestamp:', error)
  }
}

export { updateTimestamp }
