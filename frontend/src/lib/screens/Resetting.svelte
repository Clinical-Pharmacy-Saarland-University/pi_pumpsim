<script lang="ts">
  import { t } from '../locale.svelte'
</script>

<div class="reset">
  <div class="spinner"></div>
  <h1>{t('reset.title')}</h1>
  <p>{t('reset.sub')}</p>
</div>

<style>
  .reset {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-align: center;
  }
  .spinner {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 5px solid var(--surface2);
    border-top-color: var(--water-top);
    animation: spin 0.9s linear infinite;
  }
  h1 {
    font-size: 30px;
    font-weight: 800;
  }
  p {
    font-size: 17px;
    color: var(--dim);
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
